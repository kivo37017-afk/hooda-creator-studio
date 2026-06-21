# Migrations

Este projeto partilha o MESMO Supabase do app principal (Hooda),
projeto `htrqomkmggjjwknepgsc`.

As tabelas `channels` e `videos` deste Studio vivem nesse projeto e a
migration que as cria está no repositório `hooda-login-portal`, em
`supabase/migrations/20260621212028_studio_channels_videos.sql`.

Não recries `profiles` nem `handle_new_user` aqui — já existem no
projeto unificado e pertencem ao Hooda.
