import { Router } from 'express'
import { prisma } from '@ecom/db'
import { optionalAuth } from '../../middleware/auth.middleware'

export const productsRouter = Router()

// Public catalog
productsRouter.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query['page'] ?? 1)
    const limit = Number(req.query['limit'] ?? 20)
    const skip = (page - 1) * limit
    const category = req.query['category'] as string | undefined
    const vendorId = req.query['vendorId'] as string | undefined
    const featured = req.query['featured'] === 'true'

    const where = {
      status: 'ACTIVE' as const,
      ...(category && { category: { slug: category } }),
      ...(vendorId && { vendorId }),
      ...(featured && { isFeatured: true }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: { where: { isActive: true }, take: 1 },
          category: true,
          vendor: { select: { storeName: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    res.json({
      success: true,
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

productsRouter.get('/search', async (req, res, next) => {
  try {
    const q = (req.query['q'] as string) ?? ''
    const page = Number(req.query['page'] ?? 1)
    const limit = Number(req.query['limit'] ?? 20)
    const skip = (page - 1) * limit

    // Full-text search using Postgres
    const products = await prisma.$queryRaw`
      SELECT p.id, p.name, p.slug, p.description
      FROM products p
      WHERE p.status = 'ACTIVE'
        AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, ''))
            @@ plainto_tsquery('english', ${q})
      ORDER BY ts_rank(
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
        plainto_tsquery('english', ${q})
      ) DESC
      LIMIT ${limit} OFFSET ${skip}
    `

    res.json({ success: true, data: products })
  } catch (err) {
    next(err)
  }
})

productsRouter.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params['slug'], status: 'ACTIVE' },
      include: {
        variants: { where: { isActive: true } },
        category: true,
        vendor: { select: { storeName: true, slug: true, logo: true } },
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { profile: true } } },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    // Track recently viewed for logged in users
    if (req.user) {
      await prisma.recentlyViewed.upsert({
        where: { userId_productId: { userId: req.user.sub, productId: product.id } },
        update: { viewedAt: new Date() },
        create: { userId: req.user.sub, productId: product.id },
      })
    }

    return res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
})
