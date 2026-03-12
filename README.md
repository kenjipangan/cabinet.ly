# Cabinet Quotation Tool

A simple web-based tool for cabinet makers to quickly generate professional quotations without creating full SketchUp models.

## Features

- Quick cabinet dimension input
- Automatic material calculation (sheet goods, edge banding)
- Hardware cost estimation (hinges, drawer slides, handles)
- Labor cost calculation
- Customizable markup
- Professional quotation output
- Print and copy functionality

## How to Use

1. Open `index.html` in your web browser
2. Fill in the project details:
   - Client name and project name
   - Cabinet dimensions (width, height, depth)
   - Cabinet configuration (doors, drawers, shelves)
   - Material costs
   - Hardware costs
   - Labor hours and rate
   - Desired markup percentage

3. Click "Calculate Quote" to generate the quotation
4. Print or copy the quotation to share with your client

## Customization

You can adjust default values in the HTML file to match your typical projects:

- Material costs (plywood, MDF, etc.)
- Hardware costs (hinges, slides, handles)
- Labor rates
- Markup percentages

## Material Calculation

The tool automatically calculates:
- Sheet material needed (with 15% waste factor)
- Edge banding length
- Hardware quantities based on doors and drawers

## Tips

- Save different versions with preset values for common cabinet types
- Adjust the waste factor in `app.js` if needed (currently 15%)
- Update material and hardware costs regularly to reflect current prices
- Use the labor hours field to account for complexity

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

---

Built for hobbyist cabinet makers who need quick, professional quotations.
