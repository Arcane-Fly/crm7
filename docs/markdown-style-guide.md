# Markdown Style Guide for AI Agents

This guide provides comprehensive rules and best practices for AI agents to follow when creating and modifying markdown files. It ensures consistency and adherence to markdownlint standards.

## Table of Contents

1. [Basic Markdown Rules](#basic-markdown-rules)
1. [Markdownlint Rules](#markdownlint-rules)
1. [AI-Specific Guidelines](#ai-specific-guidelines)
1. [Common Pitfalls](#common-pitfalls)
1. [Testing and Validation](#testing-and-validation)

## Basic Markdown Rules

### Heading Hierarchy

- Always start with a single H1 (`#`) at the top of the document
- Maintain proper nesting (h1 -> h2 -> h3)
- Never skip heading levels
- Surround headings with blank lines

```markdown
# Main Title (H1)

## Section (H2)

### Subsection (H3)
```

### Lists

#### Ordered Lists (MD029)

1. Always use "1." for ordered lists (one-based numbering)
1. Maintain consistent indentation (2 spaces)
1. Include blank lines before and after lists
1. For nested lists, indent 2 spaces:
   1. First nested item
   1. Second nested item
1. Resume parent list numbering

#### Unordered Lists

- Use hyphen (`-`) for unordered lists
- Maintain consistent indentation
- Include blank lines before and after lists
- For nested lists:
  - First nested item
  - Second nested item
- Resume parent list

### Code Blocks

- Surround code blocks with blank lines
- Specify the language for syntax highlighting
- Use triple backticks (```)

```javascript
// Example code block
function example() {
  return true;
}
```

### Links and Images

- Use reference-style links for repeated URLs
- Include alt text for images
- Use descriptive link text

```markdown
[Descriptive Link Text][reference]
![Alt text for image](path/to/image.png)

[reference]: https://example.com
```

## Markdownlint Rules

### MD029 - Ordered List Numbering

- Use "1." for all numbers (one-based)
- Never mix numbering styles
- Maintain correct indentation

✅ Correct:

```markdown
1. First item
1. Second item
1. Third item
```

❌ Incorrect:

```markdown
1. First item
2. Second item
3. Third item
```

### MD022 - Headings Must Be Surrounded by Blank Lines

✅ Correct:

```markdown
# Heading

Content starts here
```

❌ Incorrect:

```markdown
# Heading

Content starts here
```

### MD031 - Fenced Code Blocks Must Be Surrounded by Blank Lines

✅ Correct:

````markdown
Text before code.

```javascript
code();
```
````

Text after code.

````markdown
### MD032 - Lists Must Be Surrounded by Blank Lines

✅ Correct:

```markdown
Text before list.

- Item 1
- Item 2

Text after list.
```
````

## AI-Specific Guidelines

### Handling Dynamic Content

1. When generating numbered lists dynamically:

   - Always use "1." for each item
   - Let the markdown renderer handle the numbering
   - Maintain consistent indentation

1. When modifying existing lists:
   - Preserve the original numbering style if different
   - Document any style variations in comments

### State Management

1. Track list depth when generating nested structures:

   ```markdown
   1. Parent item
      1. Child item
         1. Grandchild item
   ```

1. Maintain context for reference-style links:

   ```markdown
   [Link 1][ref1]
   [Link 2][ref2]

   [ref1]: https://example.com/1
   [ref2]: https://example.com/2
   ```

### Error Prevention

1. Always validate heading hierarchy
1. Ensure proper list continuation after interruptions
1. Verify code block syntax
1. Check link reference definitions

## Common Pitfalls

1. Inconsistent list numbering styles
1. Missing blank lines around blocks
1. Incorrect heading hierarchy
1. Unmatched code block delimiters
1. Undefined link references

## Testing and Validation

1. Use markdownlint for validation:

   ```bash
   markdownlint *.md
   ```

1. Common markdownlint rules to check:

   - MD001 - heading increment
   - MD022 - headers should be surrounded by blank lines
   - MD029 - ordered list item prefix
   - MD031 - fenced code blocks should be surrounded by blank lines
   - MD032 - lists should be surrounded by blank lines

1. Automated testing suggestions:

   ```javascript
   // Example test
   expect(markdown).toMatchRule('MD029');
   ```

## Version Control Considerations

1. Preserve existing formatting when possible
1. Document style exceptions
1. Include markdownlint configuration in project
1. Use consistent line endings

---

**Note**: This style guide is specifically designed for AI agents to maintain consistent, high-quality markdown documentation. Always refer to project-specific guidelines when they differ from these general rules.
