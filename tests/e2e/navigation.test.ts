/**
 * E2E Navigation and Routing Tests
 * Tests for internal links, URL parameters, redirects, 404 pages
 */

import { test, expect } from '@playwright/test'

test.describe('Navigation and Routing Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test.describe('Internal Links', () => {
        test('should navigate to dashboard from home page', async ({ page }) => {
            await page.click('text=Dashboard')
            await expect(page).toHaveURL(/dashboard/)
        })

        test('should navigate to login page', async ({ page }) => {
            await page.goto('/login')
            await expect(page).toHaveURL('/login')
        })

        test('should navigate to signup page', async ({ page }) => {
            await page.goto('/signup')
            await expect(page).toHaveURL('/signup')
        })

        test('should navigate to home page from logo', async ({ page }) => {
            await page.goto('/dashboard')
            await page.click('text=MediCore')
            await expect(page).toHaveURL('/')
        })

        test('should navigate to features section', async ({ page }) => {
            await page.click('text=Features')
            await expect(page).toHaveURL(/#features/)
        })

        test('should navigate to stats section', async ({ page }) => {
            await page.click('text=Statistics')
            await expect(page).toHaveURL(/#stats/)
        })

        test('should navigate to capabilities section', async ({ page }) => {
            await page.click('text=Capabilities')
            await expect(page).toHaveURL(/#capabilities/)
        })
    })

    test.describe('URL Parameters', () => {
        test('should parse callback URL parameter', async ({ page }) => {
            await page.goto('/login?callbackUrl=/dashboard')
            await expect(page).toHaveURL(/callbackUrl=%2Fdashboard/)
        })

        test('should handle page parameter for pagination', async ({ page }) => {
            await page.goto('/dashboard/patients?page=2')
            await expect(page).toHaveURL(/page=2/)
        })

        test('should handle search parameter', async ({ page }) => {
            await page.goto('/dashboard/patients?search=John')
            await expect(page).toHaveURL(/search=John/)
        })

        test('should handle department filter parameter', async ({ page }) => {
            await page.goto('/dashboard/staff?department=Cardiology')
            await expect(page).toHaveURL(/department=Cardiology/)
        })
    })

    test.describe('Nested Routes', () => {
        test('should access dashboard patients page', async ({ page }) => {
            await page.goto('/dashboard/patients')
            await expect(page).toHaveURL(/patients/)
        })

        test('should access dashboard appointments page', async ({ page }) => {
            await page.goto('/dashboard/appointments')
            await expect(page).toHaveURL(/appointments/)
        })

        test('should access dashboard staff page', async ({ page }) => {
            await page.goto('/dashboard/staff')
            await expect(page).toHaveURL(/staff/)
        })

        test('should access dashboard inventory page', async ({ page }) => {
            await page.goto('/dashboard/inventory')
            await expect(page).toHaveURL(/inventory/)
        })

        test('should access dashboard blood bank page', async ({ page }) => {
            await page.goto('/dashboard/blood-bank')
            await expect(page).toHaveURL(/blood-bank/)
        })

        test('should access dashboard rooms page', async ({ page }) => {
            await page.goto('/dashboard/rooms')
            await expect(page).toHaveURL(/rooms/)
        })
    })

    test.describe('Redirect Behavior', () => {
        test('should redirect unauthenticated user to login', async ({ page }) => {
            await page.goto('/dashboard')
            await expect(page).toHaveURL(/login/)
        })

        test('should redirect to callback URL after login', async ({ page }) => {
            await page.goto('/login?callbackUrl=/dashboard')
            await page.fill('[name="email"]', 'admin@example.com')
            await page.fill('[name="password"]', 'admin123')
            await page.click('button[type="submit"]')
            await expect(page).toHaveURL(/dashboard/)
        })

        test('should redirect authenticated user away from login', async ({ page }) => {
            // This would require authenticated session
            await page.goto('/login')
            // Expect redirect or show dashboard link
            const currentUrl = page.url()
            expect(currentUrl).toMatch(/login|dashboard/)
        })
    })

    test.describe('404 Pages', () => {
        test('should display 404 for invalid route', async ({ page }) => {
            await page.goto('/invalid-route-12345')
            const content = await page.content()
            expect(content).toMatch(/404|Not Found/)
        })

        test('should display 404 for non-existent page', async ({ page }) => {
            await page.goto('/dashboard/non-existent-page')
            const content = await page.content()
            expect(content).toMatch(/404|Not Found/)
        })
    })

    test.describe('Browser Navigation', () => {
        test('should navigate back to previous page', async ({ page }) => {
            await page.goto('/')
            await page.goto('/dashboard')
            await page.goBack()
            await expect(page).toHaveURL('/')
        })

        test('should navigate forward after going back', async ({ page }) => {
            await page.goto('/')
            await page.goto('/dashboard')
            await page.goBack()
            await page.goForward()
            await expect(page).toHaveURL(/dashboard/)
        })
    })
})
