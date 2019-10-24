-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2019 at 03:59 PM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vk`
--
CREATE DATABASE IF NOT EXISTS `vk` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `vk`;

-- --------------------------------------------------------

--
-- Table structure for table `tracefollowers`
--

CREATE TABLE `tracefollowers` (
  `userID` int(11) NOT NULL,
  `vacID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `userType` varchar(5) NOT NULL,
  `firstName` varchar(16) NOT NULL,
  `lastName` varchar(20) NOT NULL,
  `userName` varchar(12) NOT NULL,
  `password` varchar(8) NOT NULL,
  `userConnected` tinyint(1) NOT NULL,
  `userSock` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `userType`, `firstName`, `lastName`, `userName`, `password`, `userConnected`, `userSock`) VALUES
(1, 'admin', '', '', 'ADMIN', 'lltr', 1, 'Jq9O8KQcisOa8MweAAAz'),
(2, 'user', 'adam', 'golan', 'golan69', '3333', 1, '8YQGQnsYLRcsKU1-AAA0');

-- --------------------------------------------------------

--
-- Table structure for table `vacations`
--

CREATE TABLE `vacations` (
  `vacID` int(11) NOT NULL,
  `vacDest` varchar(50) NOT NULL,
  `vacDesc` varchar(5000) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `vacPrice` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `vacations`
--

INSERT INTO `vacations` (`vacID`, `vacDest`, `vacDesc`, `startDate`, `endDate`, `vacPrice`) VALUES
(1, 'paris, france', 'Enjoy five nights at the City of Lights', '2019-10-15', '2019-10-21', '3300'),
(2, 'london, england', 'Spend a two week period trying to understand Brexit', '2019-10-22', '2019-11-05', '3600'),
(3, 'new york, USA', 'Spend Christmas with drunk Santa!!!', '2019-12-23', '2019-12-28', '5600'),
(4, 'tokyo, japan', 'Come to Tokyo! A place you can be the Kitten you\'ve always dreamed to be!', '2019-10-20', '2019-11-10', '12000'),
(5, 'barcelona, spain', 'Come to the Gaudy city to try some chedar', '2019-11-12', '2019-11-20', '1300'),
(6, 'copenhagen, denmark', 'Enjoy some pervertious time playing Lego with stranger children', '2019-10-23', '2019-10-31', '1750'),
(7, 'moscow, russia', 'Spend a week at the land of freezing your balls off', '2020-01-13', '2020-01-22', '1200'),
(8, 'vienna, austria', 'We\'ve got the most ancient zoo in the world!!! And that\'s it', '2019-11-21', '2019-11-26', '750'),
(9, 'stockholm, sweden', 'Become king Gustav\'s bitch for a week!', '2019-11-14', '2019-11-21', '3200'),
(10, 'berlin, germany', 'Come on down to warm Berlin, and join the fourth reich!', '2019-10-15', '2019-10-26', '3600'),
(11, 'paris, france', 'This one is to check the chart, it\'s per destination follows', '2019-10-18', '2019-10-29', '2200');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tracefollowers`
--
ALTER TABLE `tracefollowers`
  ADD KEY `userID` (`userID`),
  ADD KEY `vacID` (`vacID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- Indexes for table `vacations`
--
ALTER TABLE `vacations`
  ADD PRIMARY KEY (`vacID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vacations`
--
ALTER TABLE `vacations`
  MODIFY `vacID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tracefollowers`
--
ALTER TABLE `tracefollowers`
  ADD CONSTRAINT `tracefollowers_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `tracefollowers_ibfk_2` FOREIGN KEY (`vacID`) REFERENCES `vacations` (`vacID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
