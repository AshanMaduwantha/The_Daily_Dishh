package com.paf.socialmedia.service;

import com.paf.socialmedia.document.Message;
import com.paf.socialmedia.dto.MessageDTO;
import com.paf.socialmedia.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public MessageDTO sendMessage(MessageDTO messageDTO) {
        Message message = new Message();
        message.setSenderId(messageDTO.getSenderId());
        message.setReceiverId(messageDTO.getReceiverId());
        message.setContent(messageDTO.getContent());
        message.setTimestamp(new Date());
        message.setIsRead(false);
        Message savedMessage = messageRepository.save(message);
        return new MessageDTO(savedMessage.getId(), savedMessage.getSenderId(), savedMessage.getReceiverId(),
                savedMessage.getContent(), savedMessage.getTimestamp(), savedMessage.getIsRead());
    }

    public List<Message> getMessages(String userId1, String userId2) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(userId1, userId2, userId2, userId1);
    }
}
