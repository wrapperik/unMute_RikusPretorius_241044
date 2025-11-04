-- MySQL dump 10.13  Distrib 9.5.0, for macos26.0 (arm64)
--
-- Host: centerbeam.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `JournalEntries`
--

DROP TABLE IF EXISTS `JournalEntries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `JournalEntries` (
  `entry_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`entry_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `JournalEntries`
--

LOCK TABLES `JournalEntries` WRITE;
/*!40000 ALTER TABLE `JournalEntries` DISABLE KEYS */;
INSERT INTO `JournalEntries` VALUES (8,2,'Test user entry','ffff','2025-09-29 22:53:28'),(9,1,'A Fresh Start','This morning felt different. I woke up before my alarm and for once didn’t feel that heavy pull to stay in bed. Maybe it was the sunlight cutting through my curtains or just a shift inside me, but I got up without the usual drag.\n\nI made coffee, sat quietly, and thought about how many times I’ve promised myself a reset. The difference today was that I didn’t try to plan everything at once—I just took one small step forward. It felt manageable.\n\nBy midday, I noticed I was actually lighter on my feet, like carrying less weight in my chest. It’s not a miracle day, but it’s a day where I’m genuinely proud of myself for showing up.','2025-09-29 22:59:42'),(10,1,'Slow Sunday','Today had no rush. I stayed in my pajamas longer than usual, brewed a second cup of tea, and played music in the background. There was something comforting about the slowness.\n\nI caught myself thinking about how much I usually chase productivity, but letting myself just exist without guilt felt like a rare gift. I read a few pages of a book and let the world outside spin without me needing to catch up.\n\nBy the time evening rolled in, I felt content. Not thrilled, not overly joyful, just calm in the stillness. Sometimes that’s enough.','2025-09-29 23:00:38'),(11,1,'Going Through the Motions','The day started like any other—wake up, check my phone, get dressed, and head out. Nothing special, nothing terrible. Just the usual rhythm.\n\nAt work, I found myself zoning out during conversations. I responded when needed, laughed when expected, but honestly, I wasn’t really present. It felt like I was acting out a script I’ve memorized a thousand times.\n\nWhen I got home, I didn’t even know how to describe the day. It wasn’t bad, but it wasn’t good either. Just… there. And maybe that’s okay too.','2025-09-29 23:01:05'),(12,1,'Missing Something','Woke up with that sinking feeling again, like something important is missing. I couldn’t put my finger on it, but it followed me everywhere I went today.\n\nEven when I was surrounded by people, laughter, and conversation, I felt like I was behind a glass wall. Everyone else was connected, but I couldn’t quite reach through. It’s exhausting carrying that invisible weight.\n\nBy nightfall, I just wanted quiet. I curled up in bed early, hoping that tomorrow brings a bit of relief. Some days are just heavier, and today was one of them.','2025-09-29 23:02:41'),(13,1,'When Nothing Works','Today tested every bit of my patience. I tried to work on something important, but nothing flowed. Every attempt felt like hitting a wall, and each failure chipped away at me.\n\nThe more I tried to push through, the more tangled everything became. I wanted to scream at my laptop, my surroundings, maybe even at myself. It was like the universe kept saying “not today.”\n\nI ended up walking away, shutting it all down. Frustration doesn’t even cover it—I felt trapped in the cycle of effort and zero progress. Hopefully tomorrow feels different.','2025-09-29 23:03:01'),(14,5,'FUCK AWS','Deasr diary, i hope bezos gets molested','2025-10-22 19:44:38'),(15,6,'1231','asdasdad','2025-10-23 11:03:59'),(16,14,'wow i love this ui design','love you sm :)','2025-10-30 07:06:46'),(17,19,'😁','😁','2025-11-04 15:01:00'),(18,11,'Entry 1','dfdddd','2025-11-04 19:34:10');
/*!40000 ALTER TABLE `JournalEntries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MoodCheckIns`
--

DROP TABLE IF EXISTS `MoodCheckIns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MoodCheckIns` (
  `checkin_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `entry_id` int DEFAULT NULL,
  `mood` enum('excited','happy','indifferent','sad','frustrated') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`checkin_id`),
  KEY `user_id` (`user_id`),
  KEY `entry_id` (`entry_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MoodCheckIns`
--

LOCK TABLES `MoodCheckIns` WRITE;
/*!40000 ALTER TABLE `MoodCheckIns` DISABLE KEYS */;
INSERT INTO `MoodCheckIns` VALUES (4,2,8,'frustrated','2025-09-29 22:53:28'),(5,1,9,'happy','2025-09-29 22:59:42'),(6,1,10,'happy','2025-09-29 23:00:38'),(7,1,11,'indifferent','2025-09-29 23:01:05'),(8,1,12,'sad','2025-09-29 23:02:41'),(9,1,13,'frustrated','2025-09-29 23:03:01'),(10,5,14,'frustrated','2025-10-22 19:44:38'),(11,6,15,'indifferent','2025-10-23 11:03:59'),(12,14,16,'excited','2025-10-30 07:06:47'),(13,19,17,'happy','2025-11-04 15:01:01'),(14,11,18,'excited','2025-11-04 19:34:10');
/*!40000 ALTER TABLE `MoodCheckIns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PostLikes`
--

DROP TABLE IF EXISTS `PostLikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PostLikes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `post_id` (`post_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PostLikes`
--

LOCK TABLES `PostLikes` WRITE;
/*!40000 ALTER TABLE `PostLikes` DISABLE KEYS */;
INSERT INTO `PostLikes` VALUES (64,8,2,'2025-09-24 20:46:07'),(70,11,2,'2025-09-24 20:55:42'),(73,9,2,'2025-09-24 23:09:31'),(79,10,2,'2025-10-15 20:51:43'),(81,10,1,'2025-10-25 11:50:28'),(82,11,1,'2025-10-28 14:18:08'),(83,9,1,'2025-10-28 16:13:50'),(90,22,8,'2025-10-28 20:52:24'),(93,26,11,'2025-10-30 07:27:00'),(94,25,11,'2025-11-02 11:50:54'),(95,26,19,'2025-11-04 14:53:00');
/*!40000 ALTER TABLE `PostLikes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PublicPosts`
--

DROP TABLE IF EXISTS `PublicPosts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PublicPosts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `topic` enum('Joy','Anxiety','Stress','Depression','Motivation','Other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Other',
  `is_anonymous` tinyint(1) NOT NULL DEFAULT '0',
  `is_flagged` tinyint(1) NOT NULL DEFAULT '0',
  `flagged_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PublicPosts`
--

LOCK TABLES `PublicPosts` WRITE;
/*!40000 ALTER TABLE `PublicPosts` DISABLE KEYS */;
INSERT INTO `PublicPosts` VALUES (23,11,'Hey everyone,\n\nI\'ve been trying to get better at talking about mental health stuff lately, but some of my anxiety triggers are just… weirdly specific.\n\nWe all know the big ones: work stress, money worries, heavy relationship stuff. But I\'m talking about the things that hit you out of nowhere and feel completely ridiculous, but still send your heart rate spiking.\n\nI\'ll kick this off:\n\nFor me, it’s getting a text message that just says \"Call me when you get a second.\" No context, no emoji, nothing. My brain immediately jumps to the worst possible scenarios (Did I forget a bill? Is someone hurt? Am I about to be fired?) and I can\'t think straight until I make the call. It\'s totally irrational, but it’s a huge wave of stress every single time.\n\nSo, I\'m genuinely curious: What is your most unexpected or strangely specific anxiety trigger?\n\nMaybe sharing the weird ones will help us all realize we\'re not alone in these battles.','Guys, what’s your most unexpected anxiety trigger?','Anxiety',0,0,NULL,'2025-10-28 21:12:09'),(24,11,'We all know the big, brutal parts of depression: the exhaustion, the sadness, the losing interest in everything. It’s a monster.\n\nBut I\'ve been thinking about the small, almost invisible things it steals from you—the things you don\'t realize are gone until you’re on the other side. Not the career or the relationship, but the tiny, everyday feelings or abilities.\n\nFor me lately, it\'s the ability to enjoy music like I used to. It\'s just noise now, and that used to be my number one escape. Or sometimes it\'s the energy to even start a simple task like loading the dishwasher, even though it would only take two minutes. It feels like I\'m trying to lift a heavy, wet blanket just to move my arm.\n\nSo, what small, non-obvious, or weirdly specific thing does depression take away from you?\n\nMaybe naming these things can help us feel less alone in the fight against them.\n\nHang in there','The \"Heavy Blanket\" effect: What small, non-obvious thing does depression steal from you?','Depression',0,0,NULL,'2025-10-28 21:15:11'),(25,11,'That\'s a very timely and relatable topic for a community, especially one focused on men\'s mental health where stress is often internalized.\n\nHere is a mock forum entry, written from the perspective of a user, \"u/SteadyStudent94,\" focusing on finding small wins during high-stress exam periods:\n\n💡 The Exam Grind: What\'s the one small thing that brings you a moment of genuine happiness when you\'re completely buried in stress?\nHey everyone,\n\nI\'m deep in the exam and deadline hell right now, and honestly, the stress is starting to blur the days together. We all know the pressure is immense—it\'s easy to just tunnel vision and feel miserable until it\'s all over.\n\nBut I\'ve been trying to force myself to find these tiny, almost ridiculous moments of joy just to keep my head above water. It\'s not about ignoring the pressure, but about carving out a few seconds where the stress doesn\'t exist.\n\nFor me, it\'s making a perfect cup of coffee (seriously, weighing the beans and getting the pour-over right) and then sitting outside for five minutes before I open the books again. It’s a tiny, selfish win that doesn\'t hurt my study time but makes the next few hours bearable.\n\nSo, when you\'re completely buried under stress—whether it\'s exams, a huge work project, or anything else—what\'s that one small, non-productive thing that brings you a moment of pure, genuine happiness?\n\nLet\'s share some ideas for small mental breaks.','What\'s the one small thing that brings you a moment of genuine happiness when you\'re completely buried in stress?','Motivation',0,1,'2025-10-28 21:26:48','2025-10-28 21:16:24'),(26,17,'Living with anxiety and depression can be exhausting — not just for the person experiencing it, but also for the person who loves them. I want to share a few things that really help, from my own perspective as someone who’s been on the inside of it.\n\nBe patient, even when you don’t understand.\nAnxiety and depression don’t always make sense — even to us. Some days we can explain what’s wrong; other days, we just can’t. Your calm presence, even in silence, means more than “fixing” ever could.\n\nAsk what we need, not what’s wrong.\nSometimes asking “What can I do to make this moment easier?” helps more than “Why do you feel like this?” It shows you want to help us move through it, not analyze it.\n\nSmall gestures go a long way.\nA gentle touch, a meal cooked, or just sitting next to us without needing conversation — those things remind us that we’re loved and safe.\n\nDon’t take withdrawal personally.\nWhen we pull away, it’s rarely about you. It’s usually because our mind feels heavy or loud. Giving us space without disappearing completely helps us find our way back.\n\nEncourage, don’t pressure.\n“Let’s go for a walk together” feels loving. “You need to get out more” feels like judgment. Support is about inviting, not pushing.\n\nTake care of yourself too.\nSupporting someone with mental illness can be hard. You can’t pour from an empty cup — please rest, set boundaries, and get your own support when you need it. We don’t want to be your only source of purpose or care.\n\nAt the end of the day, we don’t expect perfection — just compassion. Knowing you’re trying means everything. Love doesn’t cure mental illness, but it can make the journey a lot less lonely.','How to support your partner living with mental illnesses','Anxiety',0,0,NULL,'2025-10-30 07:23:07');
/*!40000 ALTER TABLE `PublicPosts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Resources`
--

DROP TABLE IF EXISTS `Resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resources` (
  `resource_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource_id`),
  KEY `idx_resources_title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Resources`
--

LOCK TABLES `Resources` WRITE;
/*!40000 ALTER TABLE `Resources` DISABLE KEYS */;
INSERT INTO `Resources` VALUES (2,'Tips for dealing with anxiety','https://www.helpguide.org/mental-health/anxiety/tips-for-dealing-with-anxiety','This article offers practical strategies to manage anxiety, including relaxation techniques, lifestyle changes, and tips for building a support system. It’s a great resource for users seeking actionable advice to cope with anxiety.','2025-09-24 23:03:59'),(3,'Stress Relievers: Tips to Tame Stress','https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-relievers/art-20047257','Mayo Clinic provides evidence-based methods to reduce stress, such as physical activity, healthy eating, and mindfulness practices. This comprehensive guide is ideal for users looking to incorporate stress management techniques into their daily lives.','2025-09-24 23:05:37'),(4,'5 Types of Self-Care for Every Area of Your Life','https://www.verywellmind.com/self-care-strategies-overall-stress-reduction-3144729','Verywell Mind explores five essential areas of self-care—physical, emotional, mental, spiritual, and social—and provides tips for nurturing each aspect. This article is perfect for users aiming to create a balanced self-care routine.\n','2025-09-24 23:06:40'),(5,'Men and mental health: What are we missing?','https://www.aamc.org/news/men-and-mental-health-what-are-we-missing','This article discusses the unique challenges men face regarding mental health, including societal expectations and stigma. It emphasizes the importance of open conversations and seeking help, making it a valuable resource for male users.','2025-09-24 23:07:31');
/*!40000 ALTER TABLE `Resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `content` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_flagged` tinyint(1) NOT NULL DEFAULT '0',
  `flagged_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_user_id` (`user_id`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `PublicPosts` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (26,24,12,'Interesting stuff!',0,NULL,'2025-10-28 21:26:32'),(27,26,11,'Thanks for sharing!',0,NULL,'2025-10-30 07:27:16'),(28,25,19,'That moment when a friend checks in to make sure you are OK, and you realise you aren\'t in it alone.',0,NULL,'2025-11-04 15:02:11');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `profile_picture` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,'rikush60@gmail.com','Rikus','$2b$10$k1yvGh1pLgT60Fq1qyR48.wl2iPbIQ1vpBhGsB/2AKmeb5mKxylRK',1,'pfp5.png'),(12,'tester@gmail.com','tester','$2b$10$2DmKbvfH75LAzyfirXjkLeED9a1.kxZB5QM6jIhHyerBqxWFhMlca',0,'pfp1.png'),(13,'tester2@gmail.com','tester2','$2b$10$gWynM847.Jt0Rq03d9uVkuzkyA88Vxsr/7scOsqjzMqxdIFD.vMP6',0,'pfp5.png'),(14,'danaeswart003@gmail.com','danie','$2b$10$gGG11nlAx2fJqC6UAHy4/Os6Je32/6VUGCeXMvj7iJrhARUxz.Xji',1,'pfp4.png'),(15,'victor.dupreez0@gmail.com','Victor','$2b$10$RPvP91Y/NWc3V5BQzQRfb.dvDOm/BGB79DILnDzawDJ.l/7JLDvPG',1,'pfp1.png'),(16,'tsungai@tsungai.com','Tsungai','$2b$10$nkmClS5xKcLGEAIDTbcD8u8tjN9elayBKA1x2t.IAZZ19CQdifhMi',1,'pfp4.png'),(17,'corbyncrobinson@gmail.com','Corbyn','$2b$10$B7.ijjPb40iw0FIQnsiY1ukWRGFTGx6xZ6LJLeE1qHceHjdgf3Np2',1,'pfp1.png'),(18,'241077@virtualwindow.co.za','AngieVR','$2b$10$vaeRs35OTNSqv4ahPJa.6emWg4lexRPg6OhZji8F/YUQLUnH0OlwO',0,'pfp4.png'),(19,'231012@virtualwindow.co.za','Sammy','$2b$10$g31FnBzJd3oco6Lf9dZZwO7V/ekGrXky0F2b48fr9cgeOBdE8pjKy',0,'pfp1.png');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-04 22:58:01
