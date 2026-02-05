UPDATE bootcamps 
SET required_post_links = '[{"id": "twitter-engage-1", "label": "Twitter Engagement Proof - Comment, Retweet & Tag 3 Friends on this post: https://x.com/web3righteous/status/2019481373266813176", "placeholder": "https://x.com/your_username/status/...", "required": true}]'::jsonb,
    application_questions = '[{"id": "engagement-confirm", "question": "Describe what you commented and which 3 friends you tagged on the post", "required": true}]'::jsonb
WHERE id = 'eb4c2aff-15da-4836-993b-3aa7344bc705';