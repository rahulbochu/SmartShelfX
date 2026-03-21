package backend.repository;

import backend.entity.User;
import backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Used by AlertSchedulerService to email/SMS all admins when alerts fire
    List<User> findByRole(Role role);

    List<User> findByIsActiveTrue();
}