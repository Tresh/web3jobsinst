
-- Publish the existing module so approved scholars can see it
UPDATE scholarship_modules 
SET is_published = true, updated_at = now()
WHERE id = 'c6563b8f-246c-46e0-838e-f35503546776';

-- Activate the existing task so approved scholars can see it
UPDATE scholarship_tasks 
SET status = 'active', is_published = true, updated_at = now()
WHERE id = 'c33f557c-06d9-45ba-95d2-f6c2230ef71d';
