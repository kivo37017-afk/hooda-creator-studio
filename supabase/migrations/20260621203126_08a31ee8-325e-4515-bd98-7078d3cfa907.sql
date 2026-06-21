
-- Tighten SECURITY DEFINER functions: only triggers should invoke them
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage policies: users own a folder named after their auth uid
-- videos/{uid}/{video_id}.mp4
CREATE POLICY "videos owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "videos owner write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "videos owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "videos owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "thumbs owner all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "thumbs public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'thumbnails');

CREATE POLICY "channel-assets owner all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'channel-assets' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'channel-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "channel-assets public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'channel-assets');
