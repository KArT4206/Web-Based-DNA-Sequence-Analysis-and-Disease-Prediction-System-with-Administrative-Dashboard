# DNA Sequence Analysis and Genetic Disease Prediction System with Admin Dashboard

## 1. Project Overview

The DNA Sequence Analysis and Genetic Disease Prediction System is a
web-based bioinformatics application designed to analyze DNA sequences
and predict possible genetic diseases. The system allows users to upload
DNA sequence files in FASTA format, processes them using computational
algorithms, and generates results indicating possible genetic
abnormalities and disease associations.

The system also includes an administrative dashboard that allows
administrators to manage users, datasets, uploaded DNA sequences, and
analysis results.

This project aims to bridge bioinformatics analysis and web-based
accessibility, making DNA sequence analysis easier for students,
researchers, and healthcare professionals.

------------------------------------------------------------------------

## 2. Objectives

Primary Objectives:

-   Analyze DNA sequences from FASTA files
-   Identify mutations and genetic variations
-   Predict possible genetic diseases
-   Provide web-based interface for accessibility
-   Implement admin dashboard for management

Secondary Objectives:

-   Provide scalable architecture
-   Ensure modular code design
-   Maintain secure user authentication
-   Enable dataset expansion

------------------------------------------------------------------------

## 3. System Architecture

System consists of the following components:

1.  Frontend Interface
2.  Backend Server
3.  DNA Analysis Engine
4.  Database Management System
5.  Admin Dashboard

Architecture Flow:

User → Upload DNA → Backend Processing → Python Analysis → Database →
Result Display

------------------------------------------------------------------------

## 4. Technologies Used

Frontend: - HTML - CSS - JavaScript - Bootstrap

Backend: - PHP

DNA Analysis: - Python - Bioinformatics libraries

Database: - MySQL

Server: - Apache (XAMPP)

------------------------------------------------------------------------

## 5. Project Structure

Final_Merged_Project/

admin/ analysis/ uploads/ templates/ static/ database/

index.php login.php register.php upload.php result.php

------------------------------------------------------------------------

## 6. Installation Guide

Step 1: Install XAMPP

Step 2: Move project folder to

C:`\xampp`{=tex}`\htdocs`{=tex}\

Step 3: Start Apache and MySQL

Step 4: Create database using phpMyAdmin

Database name: dna_project

Step 5: Import SQL file

------------------------------------------------------------------------

## 7. Algorithm Used

DNA Sequence Matching Algorithm

Steps:

1.  Read FASTA file
2.  Extract DNA sequence
3.  Compare with known gene sequences
4.  Detect mutations
5.  Predict disease

------------------------------------------------------------------------

## 8. Time Complexity

DNA Sequence Processing

Let:

n = length of DNA sequence

Sequence comparison:

Time Complexity: O(n)

Mutation detection:

Time Complexity: O(n)

Overall Complexity:

O(n)

If multiple gene comparison:

n = sequence length m = number of gene patterns

Time Complexity:

O(n \* m)

------------------------------------------------------------------------

## 9. Space Complexity

DNA storage:

Space Complexity: O(n)

Dataset storage:

Space Complexity: O(m)

Total Space Complexity:

O(n + m)

------------------------------------------------------------------------

## 10. Functional Modules

User Module:

-   Register
-   Login
-   Upload DNA
-   View Results

Admin Module:

-   Admin Login
-   Manage Users
-   Manage Dataset
-   View Results

Analysis Module:

-   FASTA Parser
-   Mutation Detection
-   Disease Prediction

------------------------------------------------------------------------

## 11. Data Flow

User Upload → Backend → Analysis → Database → Result

------------------------------------------------------------------------

## 12. Applications

-   Genetic disease prediction
-   Bioinformatics research
-   Academic learning
-   Healthcare analysis

------------------------------------------------------------------------

## 13. Future Enhancements

-   Machine learning integration
-   AI-based prediction
-   Cloud deployment
-   Advanced visualization

------------------------------------------------------------------------

## 14. Author

Karthik B
Abinaya 
Priyanka

------------------------------------------------------------------------

## 15. License

Educational Use Only

------------------------------------------------------------------------
