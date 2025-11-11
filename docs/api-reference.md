# HABoard API Reference

## Overview

HABoard provides a RESTful API and WebSocket interface for task management. All endpoints require authentication via Home Assistant's auth system.

**Base URL:** `/api/haboard`

**Authentication:** All requests must include a valid Home Assistant access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## REST API Endpoints

### Tasks

#### List Tasks

**GET** `/api/haboard/tasks`

List tasks with optional filters.

**Query Parameters:**
- `completed` (boolean, optional): Filter by completion status (`true`/`false`)
- `tag` (string, optional): Filter by tag name
- `limit` (integer, optional): Maximum number of results (default: 100, max: 1000)
- `offset` (integer, optional): Pagination offset (default: 0)

**Example Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://homeassistant.local:8123/api/haboard/tasks?completed=false&limit=50"
```

**Example Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy milk",
    "notes": "From the grocery store",
    "due_date": "2024-12-25",
    "due_time": "14:30:00",
    "priority": 2,
    "completed": false,
    "completed_at": null,
    "created_at": "2024-12-20T10:00:00",
    "modified_at": "2024-12-20T10:00:00",
    "device_id": "web_client",
    "version": 1,
    "tags": ["grocery", "urgent"]
  }
]
```

---

#### Create Task

**POST** `/api/haboard/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "Task title",  // Required
  "notes": "Task notes",  // Optional
  "due_date": "2024-12-31",  // Optional (ISO 8601 date)
  "due_time": "14:30:00",  // Optional (ISO 8601 time)
  "priority": 2,  // Optional (0-3, default: 0)
  "tags": ["tag1", "tag2"]  // Optional
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": 2, "tags": ["grocery"]}' \
  "http://homeassistant.local:8123/api/haboard/tasks"
```

**Response:** `201 Created`

Returns the created task object.

---

#### Get Task

**GET** `/api/haboard/tasks/{task_id}`

Get a single task by ID.

**Example Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://homeassistant.local:8123/api/haboard/tasks/550e8400-e29b-41d4-a716-446655440000"
```

**Response:** `200 OK`

Returns the task object or `404 Not Found` if task doesn't exist.

---

#### Update Task

**PUT** `/api/haboard/tasks/{task_id}`

Update an existing task.

**Request Body:** Same as Create Task (all fields optional)

**Example Request:**
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk and eggs", "completed": true}' \
  "http://homeassistant.local:8123/api/haboard/tasks/550e8400-e29b-41d4-a716-446655440000"
```

**Response:** `200 OK`

Returns the updated task object. Version number is automatically incremented.

---

#### Delete Task

**DELETE** `/api/haboard/tasks/{task_id}`

Delete a task.

**Example Request:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  "http://homeassistant.local:8123/api/haboard/tasks/550e8400-e29b-41d4-a716-446655440000"
```

**Response:** `200 OK`

```json
{
  "message": "Task deleted"
}
```

Or `404 Not Found` if task doesn't exist.

---

#### Complete/Uncomplete Task

**POST** `/api/haboard/tasks/{task_id}/complete`

Mark a task as completed or uncompleted.

**Request Body:**
```json
{
  "completed": true  // or false
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}' \
  "http://homeassistant.local:8123/api/haboard/tasks/550e8400-e29b-41d4-a716-446655440000/complete"
```

**Response:** `200 OK`

Returns the updated task with `completed_at` timestamp set.

---

#### Search Tasks

**POST** `/api/haboard/tasks/search`

Full-text search across task titles and notes using SQLite FTS5.

**Request Body:**
```json
{
  "query": "search terms",  // Required
  "limit": 50  // Optional (default: 50, max: 100)
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "grocery milk"}' \
  "http://homeassistant.local:8123/api/haboard/tasks/search"
```

**Response:** `200 OK`

Returns array of matching tasks.

**Search Features:**
- Porter stemming (searches "running" also finds "run")
- Unicode support
- Phrase search with quotes: `"buy milk"`
- Boolean operators: `grocery AND milk`, `grocery OR bread`

---

### Tags

#### List Tags

**GET** `/api/haboard/tags`

List all tags.

**Example Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://homeassistant.local:8123/api/haboard/tags"
```

**Example Response:**
```json
[
  {
    "id": "tag-uuid",
    "name": "grocery",
    "color": "#FF5733",
    "created_at": "2024-12-20T10:00:00"
  }
]
```

---

#### Create Tag

**POST** `/api/haboard/tags`

Create a new tag.

**Request Body:**
```json
{
  "name": "Tag name",  // Required
  "color": "#FF5733"  // Optional (hex color code)
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "work", "color": "#00FF00"}' \
  "http://homeassistant.local:8123/api/haboard/tags"
```

**Response:** `201 Created`

Returns the created tag or `409 Conflict` if tag name already exists.

---

## WebSocket API

HABoard uses Home Assistant's WebSocket API for real-time task synchronization.

**Connection:** `ws://homeassistant.local:8123/api/websocket`

### Message Types

#### Subscribe

Subscribe to task updates for real-time sync.

**Request:**
```json
{
  "id": 1,
  "type": "haboard/subscribe",
  "device_id": "my_device"  // Optional
}
```

**Response:**
```json
{
  "id": 1,
  "type": "result",
  "success": true,
  "result": {
    "subscribed": true,
    "device_id": "my_device"
  }
}
```

---

#### Unsubscribe

Unsubscribe from task updates.

**Request:**
```json
{
  "id": 2,
  "type": "haboard/unsubscribe"
}
```

**Response:**
```json
{
  "id": 2,
  "type": "result",
  "success": true,
  "result": {
    "subscribed": false
  }
}
```

---

#### Ping/Pong

Keep connection alive and measure latency.

**Request:**
```json
{
  "id": 3,
  "type": "haboard/ping"
}
```

**Response:**
```json
{
  "id": 3,
  "type": "event",
  "event": {
    "type": "haboard/pong"
  }
}
```

---

### Server Events

The server broadcasts these events to all subscribed clients:

#### Task Created

```json
{
  "type": "haboard/task_created",
  "task": {
    "id": "task-uuid",
    "title": "New task",
    ...
  }
}
```

#### Task Updated

```json
{
  "type": "haboard/task_updated",
  "task": {
    "id": "task-uuid",
    "title": "Updated task",
    ...
  }
}
```

#### Task Deleted

```json
{
  "type": "haboard/task_deleted",
  "task_id": "task-uuid"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

**Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate tag name)
- `500 Internal Server Error` - Server error

---

## Rate Limiting

**MVP:** No rate limiting implemented.

**Beta+:** Rate limiting will be added:
- 100 requests/minute per user for REST API
- 1000 messages/minute per WebSocket connection
- `429 Too Many Requests` response when exceeded

---

## Pagination

For endpoints that return lists (e.g., `/api/haboard/tasks`), use `limit` and `offset` parameters:

```bash
# Get first 50 tasks
GET /api/haboard/tasks?limit=50&offset=0

# Get next 50 tasks
GET /api/haboard/tasks?limit=50&offset=50
```

**Recommended:** Use `limit=100` for optimal performance.

---

## Versioning

**Current Version:** v1 (MVP)

API is currently unversioned. Breaking changes will be communicated with:
1. Deprecation warnings (2+ releases)
2. Version prefix in URL (e.g., `/api/v2/haboard/tasks`)
3. Backward compatibility period (6+ months)

---

## WebSocket Connection Example

```javascript
// JavaScript example
const ws = new WebSocket('ws://homeassistant.local:8123/api/websocket');

// Authenticate
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    access_token: 'YOUR_ACCESS_TOKEN'
  }));
};

// Subscribe to task updates
ws.send(JSON.stringify({
  id: 1,
  type: 'haboard/subscribe',
  device_id: 'web_client'
}));

// Handle events
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'haboard/task_created') {
    console.log('New task:', message.task);
  } else if (message.type === 'haboard/task_updated') {
    console.log('Updated task:', message.task);
  } else if (message.type === 'haboard/task_deleted') {
    console.log('Deleted task:', message.task_id);
  }
};
```

---

## See Also

- [Database Schema](database-schema.md) - Data models and repository API
- [Development Environment](development-environment.md) - Setup guide
- [Technology Strategy](02-technology-strategy.md) - Architecture overview
