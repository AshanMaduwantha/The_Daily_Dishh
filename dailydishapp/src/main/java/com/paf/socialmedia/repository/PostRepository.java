package com.paf.socialmedia.repository;

import com.paf.socialmedia.document.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post,String> {
    List<Post> findByUserId(String userId);

    // Search by caption (case-insensitive regex match)
    @Query("{ 'caption': { $regex: ?0, $options: 'i' } }")
    List<Post> searchByCaption(String keyword);
}
