

# 📚 NEU-Tation: Library Visitor Management System

**NEU-Tation** is a specialized web and mobile-responsive application designed for **New Era University** to digitize the logging process for students, faculty, and employees visiting the university library. 

The system replaces traditional manual logbooks with a secure, Google-integrated digital interface, providing real-time visitor analytics for administrators and a frictionless entry experience for the university community.

---


# Submission Navigation 
- **Email** - jcesperanza@neu.edu.ph
- **Password** - esperanzaJC@neu.edu.ph
- **Live Link** - https://mo-amentum-opu1.vercel.app/signin 
## ✨ Key Features

### 👤 Visitor Interface
* **Institutional SSO:** Secure login restricted exclusively to `@neu.edu.ph` Google accounts.
* **Smart Onboarding:** * **First-time Visit:** Users select their specific College or Office.
    * **Returning Users:** The system remembers profile details to bypass setup.
* **Purpose Tracking:** Buttons to select the reason for visit (e.g., Reading, Research, Computer Use, Studying).
* **Instant Feedback:** A "Welcome to NEU Library!" greeting appears upon successful validation, with an automated timer to reset for the next user.

### 🛡️ Administrative Suite
* **Real-time Dashboard:** Statistics cards showing current visitor counts for the day.
* **Advanced Data Filtering:** Summarize visitor logs using preset (Weekly, Monthly) or customized date ranges.
* **User Management & Security:** * Searchable database of all registered students and faculty.
    * **Access Control:** Admins can block specific users to prevent library entry.
* **Reporting:** Export filtered log data into CSV/Excel formats for official university documentation.

---

## 🛠️ Technical Specifications

| Feature | Implementation |
| :--- | :--- |
| **Platform** | Web & Mobile Adaptable UI (React/Next.js) |
| **Authentication** | Google OAuth 2.0 (Domain Restricted) |
| **Database** | Real-time NoSQL/Relational (Firebase or Supabase) |
| **Access Methods** | IP or QR Code-based accessing |
| **User Roles** | Superadmin, Admin, and User (Student/Faculty/Employee) |

---

## 📋 System Requirements & Logic

### Input Validation
1.  **Domain Check:** Only users with an institutional email can access the system.
2.  **Profile Completion:** If the `college_office` field is null, the user is redirected to the onboarding form.
3.  **Status Check:** If a user is flagged as `is_blocked`, they are denied entry and directed to contact a librarian.

### Output & Reporting
1.  **Statistics:** Admins view aggregate data via visual cards.
2.  **Search:** Granular search functionality to locate specific users or logs.
3.  **Exports:** Data is formatted for easy integration into university-wide reports.

---

## 🚀 Installation & Setup

Follow these steps to get the project running locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/sairarat/NEU-Tation.git](https://github.com/sairarat/NEU-Tation.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd gatekeeper-app
    ```

3.  **Enter the application folder:**
    ```bash
    cd gatekeeper-app
    ```

4.  **Install dependencies:**
    ```bash
    npm install
    ```

5.  **Configure Environment Variables:**
    Create a `.env.local` file in the `gatekeeper-app` folder and add your credentials:
    ```env
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id
    NEXT_PUBLIC_DB_URL=your_database_url
    ```

6.  **Run the application:**
    ```bash
    npm run dev

---
*Developed in requirement for Software Engineering Midterm Project: New Era University Library Management System.*
