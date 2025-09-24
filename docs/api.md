

## Data Models

### Question Types
- `mcq`: Multiple choice question with selectable choices
- `fill_blank`: Fill-in-the-blank question where user enters text

### Choice Structure
```json
{
  "label": "A",
  "content_markdown": "Choice content in markdown format"
}
```

### Answer Format
- For MCQ questions: Array of choice labels (e.g., `["A"]` or `["A", "C"]` for multiple correct answers)
- For fill_blank questions: Array of acceptable answers (e.g., `["4"]`, `["blue"]`)

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Invalid/Missing Token:**
```json
{
  "detail": "Invalid authentication credentials"
}
```

**401 Unauthorized - Not Admin:**
```json
{
  "detail": "Not authorized as admin"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Notes

- **Auto-incremented IDs**: All entity IDs are now auto-incremented integers managed by PostgreSQL
- **No ID in Create Requests**: When creating new entities, do not include an ID in the request body - it will be automatically generated
- All endpoints support soft deletion, meaning deleted items are marked as deleted but not removed from the database
- Restored items can be brought back using the restore endpoints
- Position fields are used for ordering modules within tests and questions within modules
- All content supports Markdown formatting for rich text display
- The system maintains audit trails with created_at, updated_at, and deleted_at timestamps
- Admin authentication is required for all admin endpoints