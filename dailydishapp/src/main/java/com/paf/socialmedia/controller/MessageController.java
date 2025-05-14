package com.paf.socialmedia.controller;

import com.paf.socialmedia.document.Message;
import com.paf.socialmedia.dto.MessageDTO;
import com.paf.socialmedia.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3001")
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageDTO messageDTO) {
        MessageDTO savedMessage = messageService.sendMessage(messageDTO);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/{userId1}/{userId2}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String userId1, @PathVariable String userId2) {
        return ResponseEntity.ok(messageService.getMessages(userId1, userId2));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Message service is running");
    }
}