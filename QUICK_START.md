# 🚀 Dashboard Quick Start Guide

## Get Started in 3 Steps

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open Your Browser

```
http://localhost:4321
```

### 3. Explore the Dashboard

You'll be automatically redirected to `/dashboard`

---

## 📂 File Reference

### Main Components

```
src/pages/dashboard.astro         # Main dashboard page
src/components/FlatsGrid.tsx      # Container with filtering/sorting
src/components/FlatCard.tsx       # Individual flat card
src/components/FilterBar.tsx      # Search, filter, sort controls
src/components/DashboardStats.tsx # Summary statistics
src/components/Header.astro       # Navigation header
```

### Supporting Components

```
src/components/FlatCardSkeleton.tsx  # Loading skeleton
src/layouts/Layout.astro             # Page layout with header
src/pages/index.astro                # Home (redirects to dashboard)
```

### UI Components (Shadcn)

```
src/components/ui/card.tsx      # Card component
src/components/ui/button.tsx    # Button component
src/components/ui/skeleton.tsx  # Skeleton loader
src/components/ui/select.tsx    # Select dropdown
src/components/ui/input.tsx     # Input field
```

---

## 🔧 Making Changes

### Update Dashboard Layout

Edit: `src/pages/dashboard.astro`

### Modify Flat Card Design

Edit: `src/components/FlatCard.tsx`

### Change Filtering Logic

Edit: `src/components/FlatsGrid.tsx` (look for `useMemo`)

### Update Header/Navigation

Edit: `src/components/Header.astro`

### Add New Shadcn Component

```bash
npx shadcn@latest add [component-name]
```

---

## 🧪 Testing

### Run Linter

```bash
npm run lint
```

### Auto-fix Issues

```bash
npm run lint:fix
```

### Build Project

```bash
npm run build
```

### Test API Endpoint

```bash
./test-dashboard.sh
```

---

## 📊 Data Flow

```
1. User visits /dashboard
2. FlatsGrid component mounts
3. Fetches GET /api/dashboard
4. Displays skeleton while loading
5. Receives DashboardResponseDto
6. Renders FlatCard for each flat
7. User interacts with filters
8. useMemo recalculates filtered/sorted data
9. UI updates automatically
```

---

## 🎨 Customization

### Change Colors

Edit Tailwind classes in components:

- `text-destructive` → Red for debt
- `text-green-600` → Green for paid
- `text-primary` → Primary brand color
- `text-muted-foreground` → Subtle text

### Modify Grid Layout

In `FlatsGrid.tsx`:

```tsx
// Current: 1/2/3 columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Example: 1/2/4 columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

### Add Sort Option

In `FilterBar.tsx`, add to `SortOption` type and select options

### Add Filter Option

In `FilterBar.tsx`, add to `FilterStatus` type and select options

---

## 🐛 Troubleshooting

### Dashboard Not Loading

1. Check dev server is running (`npm run dev`)
2. Check browser console for errors
3. Verify API endpoint responds: `curl http://localhost:4321/api/dashboard`

### Compilation Errors

1. Run `npm run lint:fix`
2. Check TypeScript errors: `npx tsc --noEmit`
3. Restart dev server

### Styling Issues

1. Check Tailwind is loaded
2. Verify class names are correct
3. Check browser DevTools for applied styles

---

## 📖 Documentation

- **Technical Details**: `DASHBOARD_IMPLEMENTATION.md`
- **Architecture**: `DASHBOARD_ARCHITECTURE.md`
- **User Guide**: `DASHBOARD_USER_GUIDE.md`
- **Complete Summary**: `COMPLETE_SUMMARY.md`

---

## ✅ Checklist for New Features

When adding features to the dashboard:

- [ ] Update TypeScript types in `src/types.ts`
- [ ] Add API endpoint if needed
- [ ] Create React component if interactive
- [ ] Use Astro component if static
- [ ] Apply Tailwind styling
- [ ] Add ARIA labels for accessibility
- [ ] Test responsive design
- [ ] Add error handling
- [ ] Update documentation
- [ ] Run linter and fix issues
- [ ] Test in browser

---

## 🎯 Common Tasks

### Add a New Metric to Stats

1. Edit `src/components/DashboardStats.tsx`
2. Add to `stats` array
3. Follow existing pattern

### Modify Card Appearance

1. Edit `src/components/FlatCard.tsx`
2. Update Tailwind classes
3. Maintain accessibility

### Change API Endpoint

1. Edit fetch URL in `FlatsGrid.tsx`
2. Update types if response changes
3. Test error handling

### Add New Navigation Link

1. Edit `src/components/Header.astro`
2. Add link to nav section
3. Include ARIA attributes

---

## 💡 Best Practices

### When Writing Code

- ✅ Use TypeScript types
- ✅ Add ARIA labels
- ✅ Handle errors gracefully
- ✅ Use early returns
- ✅ Keep components small
- ✅ Use semantic HTML
- ✅ Follow existing patterns

### When Styling

- ✅ Use Tailwind utilities
- ✅ Be responsive (sm:, md:, lg:)
- ✅ Use theme colors
- ✅ Maintain consistency
- ✅ Test all breakpoints

### When Testing

- ✅ Test happy path
- ✅ Test error states
- ✅ Test edge cases
- ✅ Test accessibility
- ✅ Test responsiveness

---

## 🚀 Deployment Ready

The dashboard is production-ready when:

- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Responsive design verified
- ✅ Accessibility checked
- ✅ Performance optimized
- ✅ Documentation complete

---

**Quick Links**

- [Astro Docs](https://docs.astro.build)
- [React Docs](https://react.dev)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Need Help?**

- Check documentation files
- Review component comments
- Inspect browser DevTools
- Check TypeScript errors
- Review similar components

---

✨ **Happy Coding!** ✨
