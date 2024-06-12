CREATE DATABASE  IF NOT EXISTS `comicsdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `comicsdb`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: comicsdb
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comics`
--

DROP TABLE IF EXISTS `comics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_comics` varchar(255) NOT NULL,
  `author` int DEFAULT NULL,
  `date` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `way_to_images` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `author` (`author`),
  CONSTRAINT `comics_ibfk_1` FOREIGN KEY (`author`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comics`
--

LOCK TABLES `comics` WRITE;
/*!40000 ALTER TABLE `comics` DISABLE KEYS */;
INSERT INTO `comics` VALUES (32,'Ван Пис',22,'2023-05-01','Последние слова, произнесённые Королем Пиратов Гол Д. Роджером перед казнью, вдохновили многих выйти в море: «Мои сокровища? Берите их раза они вам так нужны... ','/library/comics1'),(33,'Comic2',23,'2023-06-01','Description of Comic2','/library/comics2'),(34,'Comic3',24,'2023-07-01','Description of Comic3','/library/comics3'),(35,'Дорохедоро',22,'2023-08-01','В городе, настолько мрачном, что все называют его Дырой, люди живут в постоянном страхе. ','/library/comics4'),(36,'Comic5',23,'2023-09-01','Description of Comic5','/library/comics5'),(37,'Comic6',24,'2023-10-01','Description of Comic6','/library/comics6'),(38,'Хеллсинг',22,'2023-11-01','Вампир Алукард - древний и могущественный, вампир \"в самом расцвете сил\". Все что его интересует - это поиски по-настоящему сильного противника. Убивать и умирать - какие еще могут быть развлечения в бессмертной жизни? ','/library/comics7'),(39,'Comic8',23,'2023-12-01','Description of Comic8','/library/comics8'),(40,'Comic9',24,'2024-01-01','Description of Comic9','/library/comics9');
/*!40000 ALTER TABLE `comics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_comics` int DEFAULT NULL,
  `id_user` int DEFAULT NULL,
  `comment` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_comics` (`id_comics`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`id_comics`) REFERENCES `comics` (`id`),
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,32,22,'Comment1 on Comic1 by User1'),(2,33,23,'Comment2 on Comic2 by User2'),(3,34,24,'Comment3 on Comic3 by User3'),(4,32,25,'1111'),(5,38,25,'1111');
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre`
--

DROP TABLE IF EXISTS `genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre` (
  `id` int NOT NULL AUTO_INCREMENT,
  `genre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
INSERT INTO `genre` VALUES (25,'Action'),(26,'Comedy'),(27,'Drama'),(28,'Fantasy'),(29,'Horror'),(30,'Mystery'),(31,'Romance'),(32,'Sci-Fi');
/*!40000 ALTER TABLE `genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre_in_comics`
--

DROP TABLE IF EXISTS `genre_in_comics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre_in_comics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_genre` int DEFAULT NULL,
  `id_comics` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_genre` (`id_genre`),
  KEY `id_comics` (`id_comics`),
  CONSTRAINT `genre_in_comics_ibfk_1` FOREIGN KEY (`id_genre`) REFERENCES `genre` (`id`),
  CONSTRAINT `genre_in_comics_ibfk_2` FOREIGN KEY (`id_comics`) REFERENCES `comics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre_in_comics`
--

LOCK TABLES `genre_in_comics` WRITE;
/*!40000 ALTER TABLE `genre_in_comics` DISABLE KEYS */;
INSERT INTO `genre_in_comics` VALUES (21,25,32),(22,26,32),(23,27,33),(24,28,33),(25,29,34),(26,30,34),(27,31,35),(28,32,35),(29,25,36),(30,26,36),(31,27,37),(32,28,37),(33,29,38),(34,30,38),(35,31,39),(36,32,39),(37,25,40),(38,26,40);
/*!40000 ALTER TABLE `genre_in_comics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `date_registration` date NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (22,'User1','Description of User1','2023-01-01','user1@example.com','password1'),(23,'User2','Description of User2','2023-02-01','user2@example.com','password2'),(24,'User3','Description of User3','2023-03-01','user3@example.com','password3'),(25,'aldar','power','2024-06-06','aldarpowerhouse@gmail.com','1234'),(26,'7777','7777','2024-06-07','aldarpowerhouse7@gmail.com','7777');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-12 23:36:18
