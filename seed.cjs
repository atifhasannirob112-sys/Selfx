const fs = require('fs');
const path = require('path');

const COMMUNITY_MEMBERS = [
  "Sajid Rahman", "Naimul Islam", "Tahmid Alvi", "Fahim Ahmed", "Rohan Kabir", 
  "Adnan Chowdhury", "Mahir Asif", "Sabbir Hossain", "Tanvir Anjum", "Jamil Hasan", 
  "Imtiaz Ahmed", "Abrar Faiz", "Sadman Sakib", "Mahbub Alam", "Sakib Al", 
  "Tamim Iqbal", "Mustafizur", "Mushfiqur", "Riyad Hasan", "Taskin Ahmed", 
  "Shoriful", "Litton Das", "Mehidy Hasan", "Afif Hossain", "Soumya Sarkar", 
  "Najmul Hossain", "Tanzid Hasan", "Towhid Hridoy", "Ebadot Hossain", "Hasan Mahmud",
  "Shoaib Akhtar", "Wasim Akram", "Waqar Younis", "Imran Khan", "Babar Azam",
  "Shaheen Afridi", "Naseem Shah", "Fakhar Zaman", "Mohammad Rizwan", "Shadab Khan",
  "Virat Kohli", "Rohit Sharma", "MS Dhoni", "Jasprit Bumrah", "Hardik Pandya",
  "Aria Blaze", "Zoe Carter", "Sophia Rose", "Luna Star", "Mia Pearl",
  "David Goggins", "Andrew Tate", "Tristan Tate", "Hamza", "Iman Gadzhi",
  "Alex Hormozi", "Chris Bumstead", "Sam Sulek", "Noel Deyzel", "Zyzz"
];

const MEMBERS_FILE = path.join(process.cwd(), "community_members.json");
let existing = [];
try {
  if (fs.existsSync(MEMBERS_FILE)) {
    existing = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf-8"));
  }
} catch (e) {}

const newMembers = [...existing];
COMMUNITY_MEMBERS.forEach((name, i) => {
  const id = "seeded_" + i;
  if (!newMembers.find(m => m.id === id)) {
    newMembers.push({
      id,
      name,
      numberId: id,
      points: Math.floor(Math.random() * 5000),
      level: Math.floor(Math.random() * 50) + 1,
      niche: "Glowup Transformation",
      isOnline: Math.random() > 0.5,
      friends: [],
      incomingRequests: [],
      outgoingRequests: []
    });
  }
});

fs.writeFileSync(MEMBERS_FILE, JSON.stringify(newMembers, null, 2));
