package com.paf.socialmedia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private Date timestamp;
    private Boolean isRead;
}
