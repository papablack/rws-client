# RWS Grid System
A flexible SASS-based grid system providing responsive column layouts with simple syntax.

## Table of Contents
- [Installation](#installation)
- [Breakpoints](#breakpoints)
- [Basic Usage](#basic-usage)
- [Mixins](#mixins)
- [Examples](#examples)

## Installation
Import the mixins file into your SASS project:

```scss
@import '@rws-mixins';
```

## Breakpoints
The system uses three main breakpoint values:

| Name | Default Width | CSS Variable |
|------|---------------|-------------|
| md   | 1200px       | --rws-md-width |
| sm   | 992px        | --rws-sm-width |
| xs   | 768px        | --rws-xs-width |

Breakpoints can be customized using CSS variables or directly in the `$breakpoints` map.

## Basic Usage

### Grid Container
```scss
.container {
@include rws-gr; // Basic flex container
@include rws-gr-gap(20px); // Adds gaps between columns
}
```

### Responsive Columns
```scss
.column {
@include rws-gr-col(3, 4, 6, 12);
// 3 columns on large screens
// 4 columns on medium screens (< 1200px)
// 6 columns on small screens (< 992px)
// 12 columns on extra small screens (< 768px)
}
```

## Mixins

### rws-gr
Creates a basic flexbox container with wrap enabled.
```scss
@include rws-gr;
```

### rws-gr-gap($gap)
Adds spacing between columns.
```scss
@include rws-gr-gap(20px);
```

### rws-gr-col($lg, $md, $sm, $xs)
Defines column width for different breakpoints.
- `$lg`: width for large screens (default 12)
- `$md`: width for medium screens (optional)
- `$sm`: width for small screens (optional)
- `$xs`: width for extra small screens (optional)

### rws-gr-align($h, $v)
Controls alignment of items in the container.
- `$h`: horizontal alignment (default flex-start)
- `$v`: vertical alignment (default top)

### rws-gr-center
Centers the container relative to its parent.

## Examples

### Basic Layout with Gaps
```scss
.container {
@include rws-gr;
@include rws-gr-gap(20px);
@include rws-gr-center;

.column {
  @include rws-gr-col(4, 6, 12);
}
}
```

### Aligned Layout
```scss
.aligned-container {
@include rws-gr;
@include rws-gr-align(center, center);

.column {
  @include rws-gr-col(3);
}
}
```

### Complete Responsive Layout Example
```scss
.page-layout {
@include rws-gr;
@include rws-gr-gap(30px);
@include rws-gr-center;

.sidebar {
  @include rws-gr-col(3, 4, 12);
}

.main-content {
  @include rws-gr-col(9, 8, 12);
}

.footer {
  @include rws-gr-col(12);
}
}
```

## Advanced Tips

### Custom Breakpoints
You can override default breakpoints using CSS variables:
```css
:root {
--rws-md-width: 1400px;
--rws-sm-width: 1024px;
--rws-xs-width: 800px;
}
```

### Column Calculation
The system uses a 12-column grid by default. Column widths are calculated using:
```scss
width = (100% / 12) * columns
```

### Best Practices
1. Always start with mobile layout first
2. Use semantic class names
3. Avoid deeply nested grids
4. Consider using the gap mixin for consistent spacing
5. Test layouts across different screen sizes

## Browser Support
This grid system relies on modern CSS features including:
- Flexbox
- CSS Custom Properties (CSS Variables)
- CSS calc()

Ensure your target browsers support these features or include appropriate fallbacks.