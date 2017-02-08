-- MySQL dump 10.15  Distrib 10.0.25-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: ontax
-- ------------------------------------------------------
-- Server version	10.0.25-MariaDB-0+deb8u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `taxi_a_streets`
--

DROP TABLE IF EXISTS `taxi_a_streets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_a_streets` (
  `street_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `town_id` int(10) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`street_id`),
  KEY `FK_taxi_a_streets_taxi_a_towns` (`town_id`),
  KEY `name` (`name`),
  CONSTRAINT `FK_taxi_a_streets_taxi_a_towns` FOREIGN KEY (`town_id`) REFERENCES `taxi_a_towns` (`town_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45811 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_a_towns`
--

DROP TABLE IF EXISTS `taxi_a_towns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_a_towns` (
  `town_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`town_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23202 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_accounts`
--

DROP TABLE IF EXISTS `taxi_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_accounts` (
  `acc_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(10) CHARACTER SET utf8 NOT NULL,
  `login` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `password_hash` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `old_password_hash` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `token` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `token_expires` timestamp NULL DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `call_id` varchar(20) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `name` varchar(100) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `work_phone` varchar(20) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `personal_phone` varchar(20) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `birth_date` date DEFAULT NULL,
  `photo` varchar(200) CHARACTER SET utf8 DEFAULT NULL,
  `prefs` text CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`acc_id`),
  UNIQUE KEY `type` (`type`,`login`),
  KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=333 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_calls`
--

DROP TABLE IF EXISTS `taxi_calls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_calls` (
  `call_id` varchar(50) NOT NULL,
  `disp_id` int(10) unsigned NOT NULL,
  `dir` varchar(3) NOT NULL DEFAULT 'in',
  `phone` varchar(50) NOT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `begin_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  UNIQUE KEY `call_id` (`call_id`),
  KEY `FK_taxi_calls_taxi_accounts` (`disp_id`),
  CONSTRAINT `FK_taxi_calls_taxi_accounts` FOREIGN KEY (`disp_id`) REFERENCES `taxi_accounts` (`acc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_car_group_fares`
--

DROP TABLE IF EXISTS `taxi_car_group_fares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_car_group_fares` (
  `group_id` int(10) unsigned NOT NULL,
  `fare_id` int(10) unsigned NOT NULL,
  KEY `group_id` (`group_id`),
  KEY `fare_id` (`fare_id`),
  CONSTRAINT `taxi_car_group_fares_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `taxi_car_groups` (`group_id`),
  CONSTRAINT `taxi_car_group_fares_ibfk_2` FOREIGN KEY (`fare_id`) REFERENCES `taxi_fares` (`fare_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_car_groups`
--

DROP TABLE IF EXISTS `taxi_car_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_car_groups` (
  `group_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_cars`
--

DROP TABLE IF EXISTS `taxi_cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_cars` (
  `car_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group_id` int(10) unsigned NOT NULL,
  `name` varchar(30) DEFAULT NULL COMMENT 'e.g. Renault Scenic',
  `body_type` enum('sedan','hatchback','estate','minivan','bus') DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `plate` varchar(20) DEFAULT NULL COMMENT 'license plate',
  `photo` varchar(200) DEFAULT NULL COMMENT 'photo file path',
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `year_made` year(4) DEFAULT NULL,
  `class` varchar(20) NOT NULL DEFAULT '',
  `warrant_date` date DEFAULT NULL,
  `warrant_expires` date DEFAULT NULL,
  `insurance_num` varchar(20) DEFAULT NULL,
  `insurance_expires` date DEFAULT NULL,
  `certificate_num` varchar(20) DEFAULT NULL,
  `certificate_expires` date DEFAULT NULL,
  `odometer` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`car_id`),
  KEY `group_id` (`group_id`),
  KEY `class` (`class`),
  CONSTRAINT `taxi_cars_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `taxi_car_groups` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_channels`
--

DROP TABLE IF EXISTS `taxi_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_channels` (
  `message_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `t` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `acc_id` int(10) unsigned DEFAULT NULL,
  `loc_id` int(10) unsigned DEFAULT NULL,
  `message` text NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `t` (`t`),
  KEY `loc_id` (`loc_id`),
  KEY `FK_taxi_channels_taxi_accounts` (`acc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=144151 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_chat`
--

DROP TABLE IF EXISTS `taxi_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_chat` (
  `msg_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `t` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `from` int(10) unsigned NOT NULL,
  `to` int(10) unsigned DEFAULT NULL,
  `to_type` varchar(20) DEFAULT NULL,
  `text` text NOT NULL,
  PRIMARY KEY (`msg_id`),
  KEY `to_type` (`to_type`),
  KEY `t` (`t`),
  KEY `FK__taxi_accounts` (`from`),
  KEY `FK__taxi_accounts_2` (`to`),
  KEY `t_from_to_to_type` (`from`,`to`,`to_type`),
  CONSTRAINT `FK__taxi_accounts` FOREIGN KEY (`from`) REFERENCES `taxi_accounts` (`acc_id`),
  CONSTRAINT `FK__taxi_accounts_2` FOREIGN KEY (`to`) REFERENCES `taxi_accounts` (`acc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1647 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_customers`
--

DROP TABLE IF EXISTS `taxi_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_customers` (
  `customer_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `blacklist` enum('1','0') NOT NULL DEFAULT '0',
  `comments` text NOT NULL,
  `firm` varchar(200) DEFAULT NULL,
  `is_valid` tinyint(4) NOT NULL DEFAULT '0',
  `phone1` varchar(20) DEFAULT NULL,
  `phone2` varchar(20) DEFAULT NULL,
  `passport` varchar(20) DEFAULT NULL,
  `tin_num` varchar(20) DEFAULT NULL,
  `bank_account` varchar(20) DEFAULT NULL,
  `dl_num` varchar(20) DEFAULT NULL,
  `dl_expires` date DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `address1` varchar(200) DEFAULT NULL,
  `address2` varchar(200) DEFAULT NULL,
  `discount` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=1690 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_dispatchers`
--

DROP TABLE IF EXISTS `taxi_dispatchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_dispatchers` (
  `acc_id` int(10) unsigned NOT NULL,
  `loc_id` int(10) unsigned DEFAULT NULL,
  KEY `acc_id` (`acc_id`),
  KEY `loc_id` (`loc_id`),
  CONSTRAINT `taxi_dispatchers_ibfk_1` FOREIGN KEY (`acc_id`) REFERENCES `taxi_accounts` (`acc_id`) ON DELETE CASCADE,
  CONSTRAINT `taxi_dispatchers_ibfk_2` FOREIGN KEY (`loc_id`) REFERENCES `taxi_locations` (`loc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_driver_group_queues`
--

DROP TABLE IF EXISTS `taxi_driver_group_queues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_driver_group_queues` (
  `group_id` int(10) unsigned NOT NULL,
  `queue_id` int(10) unsigned NOT NULL,
  KEY `taxi_driver_group_queues_ibfk_1` (`group_id`),
  KEY `taxi_driver_group_queues_ibfk_2` (`queue_id`),
  CONSTRAINT `taxi_driver_group_queues_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `taxi_driver_groups` (`group_id`) ON DELETE CASCADE,
  CONSTRAINT `taxi_driver_group_queues_ibfk_2` FOREIGN KEY (`queue_id`) REFERENCES `taxi_queues` (`queue_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_driver_groups`
--

DROP TABLE IF EXISTS `taxi_driver_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_driver_groups` (
  `group_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_driver_types`
--

DROP TABLE IF EXISTS `taxi_driver_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_driver_types` (
  `type_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_drivers`
--

DROP TABLE IF EXISTS `taxi_drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_drivers` (
  `driver_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `acc_id` int(10) unsigned DEFAULT NULL,
  `car_id` int(10) unsigned DEFAULT NULL,
  `group_id` int(10) unsigned DEFAULT NULL,
  `type_id` int(10) unsigned DEFAULT NULL,
  `client_version` varchar(200) NOT NULL DEFAULT '0',
  `last_ping_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_order_time` timestamp NULL DEFAULT NULL,
  `alarm_time` timestamp NULL DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `accept_new_orders` smallint(5) unsigned NOT NULL DEFAULT '1',
  `firm` varchar(50) DEFAULT NULL,
  `is_fake` smallint(6) NOT NULL DEFAULT '0',
  `is_brig` smallint(6) NOT NULL DEFAULT '0',
  `is_online` smallint(6) NOT NULL DEFAULT '0',
  `deleted` smallint(6) NOT NULL DEFAULT '0',
  `block_until` timestamp NOT NULL DEFAULT '1999-12-31 22:00:00',
  `block_reason` varchar(50) NOT NULL DEFAULT '',
  `order_refuses` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `has_bank_terminal` tinyint(4) NOT NULL DEFAULT '0',
  `dl_num` varchar(20) DEFAULT NULL,
  `dl_expires` date DEFAULT NULL,
  `health_cert` varchar(20) DEFAULT NULL,
  `health_cert_expires` date DEFAULT NULL,
  `taxi_cert` varchar(20) DEFAULT NULL,
  `taxi_cert_expires` date DEFAULT NULL,
  PRIMARY KEY (`driver_id`),
  KEY `FK_taxi_drivers_taxi_cars` (`car_id`),
  KEY `group_id` (`group_id`),
  KEY `acc_id` (`acc_id`),
  KEY `FK_taxi_drivers_taxi_driver_types` (`type_id`),
  CONSTRAINT `FK_taxi_drivers_taxi_cars` FOREIGN KEY (`car_id`) REFERENCES `taxi_cars` (`car_id`),
  CONSTRAINT `FK_taxi_drivers_taxi_driver_types` FOREIGN KEY (`type_id`) REFERENCES `taxi_driver_types` (`type_id`) ON DELETE SET NULL,
  CONSTRAINT `taxi_drivers_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `taxi_driver_groups` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_events`
--

DROP TABLE IF EXISTS `taxi_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_events` (
  `t` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `acc_id` int(10) unsigned DEFAULT NULL,
  `event` varchar(100) NOT NULL,
  KEY `t` (`t`),
  KEY `acc_id` (`acc_id`),
  CONSTRAINT `taxi_events_ibfk_1` FOREIGN KEY (`acc_id`) REFERENCES `taxi_accounts` (`acc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_fares`
--

DROP TABLE IF EXISTS `taxi_fares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_fares` (
  `fare_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `start_price` int(10) unsigned NOT NULL DEFAULT '0',
  `minimal_price` int(10) unsigned NOT NULL DEFAULT '0',
  `kilometer_price` int(10) unsigned NOT NULL DEFAULT '0',
  `slow_hour_price` int(10) unsigned NOT NULL DEFAULT '0',
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `location_type` enum('city','town') NOT NULL,
  `hour_price` int(10) unsigned DEFAULT NULL,
  `day_price` int(10) unsigned DEFAULT NULL,
  `special_price` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`fare_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_location_dispatches`
--

DROP TABLE IF EXISTS `taxi_location_dispatches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_location_dispatches` (
  `loc_id` int(10) unsigned NOT NULL,
  `ref_type` varchar(50) DEFAULT NULL,
  `ref_id` int(10) unsigned DEFAULT NULL,
  `mode` varchar(20) NOT NULL DEFAULT 'sequential',
  `order` tinyint(4) NOT NULL DEFAULT '0',
  `importance` tinyint(4) NOT NULL DEFAULT '0',
  KEY `FK__taxi_locations` (`loc_id`),
  CONSTRAINT `FK__taxi_locations` FOREIGN KEY (`loc_id`) REFERENCES `taxi_locations` (`loc_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_locations`
--

DROP TABLE IF EXISTS `taxi_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_locations` (
  `loc_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `deleted` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `name` varchar(200) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `comments` varchar(500) NOT NULL DEFAULT '',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `do_reports` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`loc_id`),
  KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2108 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_log_logins`
--

DROP TABLE IF EXISTS `taxi_log_logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_log_logins` (
  `num` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `acc_id` int(10) unsigned NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_time` timestamp NULL DEFAULT NULL,
  `login_addr` varchar(100) DEFAULT NULL,
  `logout_addr` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`num`),
  KEY `acc_id` (`acc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5270 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_log_positions`
--

DROP TABLE IF EXISTS `taxi_log_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_log_positions` (
  `driver_id` int(10) unsigned NOT NULL,
  `t` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lat` double NOT NULL,
  `lon` double NOT NULL,
  KEY `driver_id` (`driver_id`),
  KEY `t` (`t`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_logs`
--

DROP TABLE IF EXISTS `taxi_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_logs` (
  `message_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `t` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `text` text NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `t` (`t`)
) ENGINE=InnoDB AUTO_INCREMENT=19744 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_order_stats`
--

DROP TABLE IF EXISTS `taxi_order_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_order_stats` (
  `order_id` int(10) unsigned NOT NULL,
  `fare_id` int(10) unsigned NOT NULL,
  `distance` int(10) unsigned NOT NULL,
  `slow_time` int(10) unsigned NOT NULL,
  `total_time` int(10) unsigned NOT NULL,
  `total_distance` int(10) unsigned NOT NULL DEFAULT '0',
  KEY `fare_id` (`fare_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `taxi_order_stats_ibfk_1` FOREIGN KEY (`fare_id`) REFERENCES `taxi_fares` (`fare_id`),
  CONSTRAINT `taxi_order_stats_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `taxi_orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_orders`
--

DROP TABLE IF EXISTS `taxi_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_orders` (
  `order_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_uid` varchar(40) NOT NULL,
  `owner_id` int(10) unsigned DEFAULT NULL,
  `taxi_id` int(10) unsigned DEFAULT NULL,
  `car_id` int(10) unsigned DEFAULT NULL,
  `customer_id` int(10) unsigned DEFAULT NULL,
  `service_id` int(10) unsigned DEFAULT NULL,
  `src_loc_id` int(10) unsigned DEFAULT NULL,
  `dest_loc_id` int(10) unsigned DEFAULT NULL,
  `type` varchar(10) NOT NULL DEFAULT '',
  `call_id` varchar(50) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `opt_vip` tinyint(4) NOT NULL DEFAULT '0',
  `opt_terminal` tinyint(4) NOT NULL DEFAULT '0',
  `opt_car_class` varchar(10) DEFAULT NULL,
  `src_addr` varchar(200) NOT NULL DEFAULT '',
  `dest_addr` varchar(200) NOT NULL DEFAULT '',
  `comments` text,
  `price` int(10) unsigned NOT NULL DEFAULT '0',
  `time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_assigned` timestamp NULL DEFAULT NULL,
  `time_arrived` timestamp NULL DEFAULT NULL,
  `time_started` timestamp NULL DEFAULT NULL,
  `time_finished` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `published` tinyint(4) NOT NULL DEFAULT '0',
  `cancel_reason` text,
  `exp_assignment_time` timestamp NULL DEFAULT NULL,
  `reminder_time` timestamp NULL DEFAULT NULL,
  `exp_arrival_time` timestamp NULL DEFAULT NULL,
  `est_arrival_time` timestamp NULL DEFAULT NULL,
  `arrival_distance` int(11) DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_uid` (`order_uid`),
  KEY `status` (`status`),
  KEY `time_created` (`time_created`),
  KEY `customer_id` (`customer_id`),
  KEY `car_id` (`car_id`),
  KEY `FK_taxi_orders_taxi_services` (`service_id`),
  KEY `published` (`published`),
  KEY `src_loc_id` (`src_loc_id`),
  KEY `dest_loc_id` (`dest_loc_id`),
  KEY `FK_taxi_orders_taxi_accounts` (`owner_id`),
  KEY `taxi_id` (`taxi_id`),
  KEY `FK_taxi_orders_taxi_calls` (`call_id`),
  CONSTRAINT `FK_taxi_orders_taxi_accounts` FOREIGN KEY (`owner_id`) REFERENCES `taxi_accounts` (`acc_id`),
  CONSTRAINT `FK_taxi_orders_taxi_calls` FOREIGN KEY (`call_id`) REFERENCES `taxi_calls` (`call_id`),
  CONSTRAINT `FK_taxi_orders_taxi_services` FOREIGN KEY (`service_id`) REFERENCES `taxi_services` (`service_id`),
  CONSTRAINT `customer_id` FOREIGN KEY (`customer_id`) REFERENCES `taxi_customers` (`customer_id`),
  CONSTRAINT `taxi_orders_ibfk_1` FOREIGN KEY (`car_id`) REFERENCES `taxi_cars` (`car_id`),
  CONSTRAINT `taxi_orders_ibfk_2` FOREIGN KEY (`src_loc_id`) REFERENCES `taxi_locations` (`loc_id`),
  CONSTRAINT `taxi_orders_ibfk_3` FOREIGN KEY (`dest_loc_id`) REFERENCES `taxi_locations` (`loc_id`),
  CONSTRAINT `taxi_orders_ibfk_4` FOREIGN KEY (`taxi_id`) REFERENCES `taxi_accounts` (`acc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15512 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_queue_addresses`
--

DROP TABLE IF EXISTS `taxi_queue_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_queue_addresses` (
  `range_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `queue_id` int(10) unsigned NOT NULL,
  `city` varchar(100) NOT NULL,
  `street` varchar(100) NOT NULL,
  `min_house` int(10) unsigned NOT NULL,
  `max_house` int(10) unsigned NOT NULL,
  `parity` varchar(5) NOT NULL DEFAULT 'none',
  PRIMARY KEY (`range_id`),
  KEY `FK__taxi_queues` (`queue_id`),
  CONSTRAINT `FK__taxi_queues` FOREIGN KEY (`queue_id`) REFERENCES `taxi_queues` (`queue_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_queue_drivers`
--

DROP TABLE IF EXISTS `taxi_queue_drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_queue_drivers` (
  `queue_id` int(10) unsigned NOT NULL,
  `driver_id` int(10) unsigned NOT NULL,
  `pos` int(10) unsigned NOT NULL,
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `taxi_queue_drivers_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `taxi_accounts` (`acc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_queues`
--

DROP TABLE IF EXISTS `taxi_queues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_queues` (
  `queue_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `loc_id` int(10) unsigned DEFAULT NULL,
  `order` int(10) unsigned NOT NULL DEFAULT '0',
  `priority` int(10) unsigned NOT NULL DEFAULT '0',
  `min` int(10) unsigned NOT NULL DEFAULT '0',
  `upstream` tinyint(4) NOT NULL DEFAULT '0',
  `name` varchar(100) NOT NULL DEFAULT '',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `addr` varchar(100) DEFAULT NULL,
  `radius` int(10) unsigned NOT NULL DEFAULT '0',
  `mode` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`queue_id`),
  KEY `FK_taxi_queues_taxi_queues` (`parent_id`),
  KEY `FK_taxi_queues_taxi_locations` (`loc_id`),
  CONSTRAINT `FK_taxi_queues_taxi_locations` FOREIGN KEY (`loc_id`) REFERENCES `taxi_locations` (`loc_id`),
  CONSTRAINT `FK_taxi_queues_taxi_queues` FOREIGN KEY (`parent_id`) REFERENCES `taxi_queues` (`queue_id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_service_areas`
--

DROP TABLE IF EXISTS `taxi_service_areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_service_areas` (
  `area_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT '',
  `inner_name` varchar(20) NOT NULL DEFAULT '',
  `lat` double NOT NULL,
  `lon` double NOT NULL,
  `min_lat` double NOT NULL,
  `max_lat` double NOT NULL,
  `min_lon` double NOT NULL,
  `max_lon` double NOT NULL,
  PRIMARY KEY (`area_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_service_settings`
--

DROP TABLE IF EXISTS `taxi_service_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_service_settings` (
  `name` varchar(20) NOT NULL,
  `value` varchar(500) NOT NULL,
  UNIQUE KEY `service_id_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_work_orders`
--

DROP TABLE IF EXISTS `taxi_work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_work_orders` (
  `work_id` int(11) NOT NULL,
  `order_id` int(10) unsigned NOT NULL,
  UNIQUE KEY `work_id` (`work_id`,`order_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `taxi_work_orders_ibfk_1` FOREIGN KEY (`work_id`) REFERENCES `taxi_works` (`id`),
  CONSTRAINT `taxi_work_orders_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `taxi_orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxi_works`
--

DROP TABLE IF EXISTS `taxi_works`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxi_works` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `driver_id` int(10) unsigned NOT NULL,
  `car_id` int(11) NOT NULL,
  `time_started` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_finished` timestamp NULL DEFAULT NULL,
  `odometer_begin` int(10) unsigned NOT NULL,
  `odometer_end` int(10) unsigned DEFAULT NULL,
  `begin_dispatcher` int(10) unsigned DEFAULT NULL,
  `end_dispatcher` int(10) unsigned DEFAULT NULL,
  `begin_latitude` double DEFAULT NULL,
  `begin_longitude` double DEFAULT NULL,
  `begin_address` varchar(100) DEFAULT NULL,
  `end_latitude` double DEFAULT NULL,
  `end_longitude` double DEFAULT NULL,
  `end_address` varchar(100) DEFAULT NULL,
  `gps_distance` float NOT NULL DEFAULT '0',
  `last_activity_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `_driver_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `begin_dispatcher` (`begin_dispatcher`),
  KEY `end_dispatcher` (`end_dispatcher`),
  KEY `driver_id` (`driver_id`),
  CONSTRAINT `taxi_works_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `taxi_accounts` (`acc_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1106 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-02-09  4:43:41
