package org.example.season.event;

import lombok.Getter;
import org.example.season.entity.Task;
import org.example.season.enums.TaskStatus;

@Getter
public class TaskCompletedEvent extends DomainEvent {

    private final Integer taskId;
    private final String taskTitle;
    private final Integer seasonId;
    private final Long assigneeUserId;
    private final TaskStatus previousStatus;

    public TaskCompletedEvent(Task task, TaskStatus previousStatus) {
        super("Task", task.getId() != null ? task.getId().toString() : "unknown", "season-service", "season.event.task.completed");
        this.taskId = task.getId();
        this.taskTitle = task.getTitle();
        this.seasonId = task.getSeason() != null ? task.getSeason().getId() : null;
        this.assigneeUserId = task.getUserId();
        this.previousStatus = previousStatus;
    }
}
