# Dashboard User Guide

## Accessing the Dashboard

1. **Navigate to the application**
   - Visit the root URL (`/`) - you'll be automatically redirected to the dashboard
   - Or directly visit `/dashboard`

2. **First Time Access**
   - If you have no flats yet, you'll see an empty state with a call-to-action
   - Click "Add Your First Flat" to create your first property

## Dashboard Features

### 📊 Summary Statistics (Top Cards)

Four metric cards provide a quick overview:

1. **Total Flats** - Total number of properties you're managing
2. **Total Debt** - Sum of all outstanding payments across all flats
   - Shows in RED if there's any debt
   - Shows in GREEN if all flats are paid up
3. **With Debt** - Number of flats that have outstanding payments
   - Highlighted in RED when > 0
4. **Paid Up** - Number of flats with all payments settled
   - Shows in GREEN

### 🔍 Search and Filter Bar

#### Search

- Type in the search box to filter flats by name or address
- Search is case-insensitive and matches partial text
- Results update in real-time as you type

#### Filter by Status

- **All Flats** - Shows all properties (default)
- **With Debt** - Shows only flats that have outstanding payments
- **Paid Up** - Shows only flats with zero debt

#### Sort Options

- **Name (A-Z)** - Alphabetical by flat name (default)
- **Debt (High to Low)** - Most debt first
- **Debt (Low to High)** - Least debt first
- **Date (Newest)** - Most recently added flats first
- **Date (Oldest)** - Oldest flats first

### 🏠 Flat Cards

Each flat is displayed as a card showing:

- **Name** - The flat's name (e.g., "Mokotów 2")
- **Address** - Full address (e.g., "ul. Puławska 2")
- **Debt Status**
  - "Outstanding" (RED) if debt > 0
  - "Paid" (GREEN) if debt = 0
- **Total Debt** - Formatted amount in PLN (Polish złoty)

#### Card Actions

- **View Details** - Navigate to the flat's detail page (primary button)
- **Payments** - Navigate to the flat's payments page (secondary button)

## Responsive Design

The dashboard adapts to different screen sizes:

### 📱 Mobile (< 640px)

- Statistics: 2 cards per row
- Filter bar: Stacked vertically
- Flats grid: 1 card per row

### 📱 Tablet (640px - 1024px)

- Statistics: 2 cards per row
- Filter bar: Horizontal layout
- Flats grid: 2 cards per row

### 💻 Desktop (> 1024px)

- Statistics: 4 cards in a row
- Filter bar: Horizontal layout
- Flats grid: 3 cards per row

## Navigation

### Header Menu

- **Flats Manager Logo** - Click to return to dashboard
- **Dashboard** - Current page (highlighted)
- **All Flats** - View all flats (coming soon)
- **Add Flat** - Create a new flat (button in top right)
- **User Menu** - Profile and settings (avatar in top right)

## Keyboard Navigation

The dashboard is fully keyboard accessible:

- **Tab** - Navigate between interactive elements
- **Enter/Space** - Activate buttons and links
- **Escape** - Close dropdowns
- **Arrow keys** - Navigate within select dropdowns

## Loading States

When the dashboard is loading data:

1. **Skeleton Cards** - 6 placeholder cards are shown
2. **Animated** - Subtle pulse animation indicates loading
3. **Fast** - Data loads quickly from the API

## Error Handling

If something goes wrong:

1. **Error Message** - Clear explanation of what happened
2. **Try Again Button** - Retry the data fetch
3. **User-Friendly** - No technical jargon

## Empty States

### No Flats Yet

- **Icon** - House icon
- **Message** - "No Flats Yet"
- **Action** - "Add Your First Flat" button

### No Matching Flats

- **Icon** - Search icon
- **Message** - "No Matching Flats"
- **Suggestion** - "Try adjusting your filters or search query"

## Tips for Best Use

### ✅ Organize Your Flats

- Use clear, descriptive names (e.g., "Mokotów 2" instead of "Flat 1")
- Include neighborhood or distinguishing features

### 📅 Regular Monitoring

- Check the dashboard regularly to monitor debt status
- Use the "With Debt" filter to focus on flats needing attention

### 🔎 Quick Finding

- Use search to quickly locate a specific flat
- Use sorting to prioritize your workflow

### 📊 Track Trends

- Monitor the Total Debt metric over time
- Aim to keep "Paid Up" count high

## Common Workflows

### Adding a New Flat

1. Click "Add Flat" in the header
2. Fill in the flat details
3. Submit the form
4. You'll be redirected back to the dashboard

### Checking Overdue Payments

1. Click the "With Debt" filter
2. Sort by "Debt (High to Low)"
3. Click "Payments" on the flat with highest debt
4. Review and mark payments as paid

### Finding a Specific Flat

1. Type the flat name or address in the search box
2. Click "View Details" on the matching card

### Monthly Review

1. Visit the dashboard
2. Check the "Total Debt" metric
3. Filter by "With Debt"
4. Process each flat's outstanding payments

## Troubleshooting

### Dashboard Not Loading

- Check your internet connection
- Click "Try Again" if you see an error
- Refresh the page

### Filters Not Working

- Clear the search box
- Reset filters to "All Flats"
- Refresh the page

### Debt Amount Incorrect

- Debt is calculated from unpaid payments
- Check the flat's payments page for details
- Contact support if discrepancy persists

## Next Features (Coming Soon)

- 🔐 User authentication
- 👤 User profile management
- 📧 Email notifications for overdue payments
- 📈 Charts and analytics
- 📤 Export data to CSV/PDF
- 🌙 Dark mode
- 📱 Mobile app

## Support

For questions or issues:

- Check the documentation
- Report bugs via GitHub Issues
- Contact: support@flats-manager.com

---

**Last Updated**: January 4, 2026
**Version**: 1.0.0
