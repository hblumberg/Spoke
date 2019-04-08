ALTER TABLE interaction_step DROP FOREIGN KEY `interaction_step_parent_interaction_id_index`;

ALTER TABLE interaction_step
   ADD CONSTRAINT `interaction_step_parent_interaction_id_index `
   FOREIGN KEY (`parent_id` )
   REFERENCES `interaction_step` (`id` )
   ON DELETE CASCADE;
