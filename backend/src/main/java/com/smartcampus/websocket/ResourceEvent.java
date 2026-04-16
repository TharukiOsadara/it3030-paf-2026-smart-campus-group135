package com.smartcampus.websocket;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.NoArgsConstructor;

/**
 * Resource Event Model
 * Used for broadcasting resource updates through WebSocket
 */
@NoArgsConstructor
public class ResourceEvent {
    
    @JsonProperty("type")
    private String type; // CREATE, UPDATE, DELETE
    
    @JsonProperty("action")
    private String action;
    
    @JsonProperty("resourceId")
    private String resourceId;  // MongoDB ObjectId as String
    
    @JsonProperty("resourceName")
    private String resourceName;
    
    @JsonProperty("resourceType")
    private String resourceType;
    
    @JsonProperty("location")
    private String location;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("timestamp")
    private Long timestamp;
    
    @JsonProperty("message")
    private String message;

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    /**
     * Factory method for CREATE event
     */
    public static ResourceEvent created(String id, String name, String type, String location) {
        ResourceEvent event = new ResourceEvent();
        event.setType("RESOURCE_CREATED");
        event.setAction("CREATE");
        event.setResourceId(id);
        event.setResourceName(name);
        event.setResourceType(type);
        event.setLocation(location);
        event.setStatus("ACTIVE");
        event.setTimestamp(System.currentTimeMillis());
        event.setMessage("Resource '" + name + "' has been created");
        return event;
    }

    /**
     * Factory method for UPDATE event
     */
    public static ResourceEvent updated(String id, String name, String type, String location, String status) {
        ResourceEvent event = new ResourceEvent();
        event.setType("RESOURCE_UPDATED");
        event.setAction("UPDATE");
        event.setResourceId(id);
        event.setResourceName(name);
        event.setResourceType(type);
        event.setLocation(location);
        event.setStatus(status);
        event.setTimestamp(System.currentTimeMillis());
        event.setMessage("Resource '" + name + "' has been updated");
        return event;
    }

    /**
     * Factory method for DELETE event
     */
    public static ResourceEvent deleted(String id, String name) {
        ResourceEvent event = new ResourceEvent();
        event.setType("RESOURCE_DELETED");
        event.setAction("DELETE");
        event.setResourceId(id);
        event.setResourceName(name);
        event.setTimestamp(System.currentTimeMillis());
        event.setMessage("Resource '" + name + "' has been deleted");
        return event;
    }
}
