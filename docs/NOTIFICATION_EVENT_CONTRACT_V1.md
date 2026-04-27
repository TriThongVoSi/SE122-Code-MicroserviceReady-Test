# Notification Event Contract V1 (Non-Marketplace Baseline)

## Scope
- This contract defines domain events that can produce in-app notifications.
- It is module-agnostic and does not hard-code Marketplace behavior.
- Notification delivery path: `DomainEventPublisher` -> `DomainEventListener` -> `NotificationService`.

## Event 1: `TASK_ASSIGNED`
- Source module: `season`
- Trigger: farmer assigns a task to an employee (`LaborManagementService.assignTaskToEmployee`)
- Java event type: `TaskAssignedEvent`

### Payload fields
- `eventId` (`string`, UUID)
- `occurredOn` (`datetime`)
- `eventType` (`TASK_ASSIGNED`)
- `aggregateType` (`Task`)
- `aggregateId` (`string`, task id)
- `taskId` (`integer`)
- `taskTitle` (`string`)
- `seasonId` (`integer | null`)
- `assigneeUserId` (`long | null`)
- `ownerUserId` (`long | null`)
- `assignedByUserId` (`long | null`)

### Notification mapping
- Recipient: `assigneeUserId`
- Title: `Task assigned`
- Message template: `Task '{taskTitle}' has been assigned to you.`
- Link template:
  - if `seasonId` exists: `/seasons/{seasonId}/tasks/{taskId}`
  - else: `/tasks/{taskId}`

## Event 2: `INCIDENT_REPORTED`
- Source module: `incident`
- Trigger: new incident created (`IncidentService.create`)
- Java event type: `IncidentReportedEvent`

### Payload fields
- `eventId` (`string`, UUID)
- `occurredOn` (`datetime`)
- `eventType` (`INCIDENT_REPORTED`)
- `aggregateType` (`Incident`)
- `aggregateId` (`string`, incident id)
- `incidentId` (`integer`)
- `incidentType` (`string`)
- `severity` (`string`, e.g. `LOW|MEDIUM|HIGH|CRITICAL`)
- `seasonId` (`integer | null`)
- `farmId` (`integer | null`)
- `plotId` (`integer | null`)
- `cropId` (`integer | null`)
- `ownerUserId` (`long | null`)
- `reportedByUserId` (`long | null`)

### Notification mapping
- Recipient: `ownerUserId`
- Title template: `Incident reported: {incidentType}`
- Message template: `Severity {severity} incident requires follow-up.`
- Link template:
  - if `seasonId` exists: `/seasons/{seasonId}/incidents/{incidentId}`
  - else: `/incidents/{incidentId}`

## Anti-spam behavior
- Event-driven notifications are deduplicated in a short window (2 minutes) by:
  - recipient (`userId`)
  - `title`
  - `message`
  - `link`
- This avoids burst duplicates when tests or event publishers run repeatedly.

## Marketplace adoption note (for Quynh)
- Marketplace can publish its own domain events into the same observer pipeline.
- Recommended minimum contract for marketplace events:
  - `eventType`, `aggregateType`, `aggregateId`, `occurredOn`, recipient `userId`
  - notification projection fields: `title`, `message`, `link`
- Marketplace-specific fields stay inside event payload, while notification service remains generic.
