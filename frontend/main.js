// This file would contain all the JavaScript from your original frontend code
// Including: login, signup, createBlog, renderBlogs, editBlog, deleteBlog
// Uses fetch to interact with backend
console.log("main.js is running");

const BASE_URL = "http://localhost:5000";

let currentUser = localStorage.getItem("currentUser");
let editIndex = null;

function toggleToSignup() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.remove("hidden");
}

function toggleToLogin() {
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

async function signup() {
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;
  if (!username || !password) return alert("All fields required");

  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Signup successful! Please login.");
      toggleToLogin();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Signup failed.");
  }
}

async function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("currentUser", username);
      showBlogPage();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Login failed.");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("blogPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function showBlogPage() {
  currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("signupPage").classList.add("hidden");
    document.getElementById("blogPage").classList.remove("hidden");
    document.getElementById("welcomeUser").textContent = currentUser;
    renderBlogs();
  }
}

async function createBlog() {
  const title = document.getElementById("blogTitle").value;
  const content = document.getElementById("blogContent").value;
  if (!title || !content) return alert("Title and content required");

  try {
    if (editIndex !== null) {
      const blogId = blogIds[editIndex];
      await fetch(`${BASE_URL}/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author: currentUser })
      });
      editIndex = null;
    } else {
      await fetch(`${BASE_URL}/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author: currentUser })
      });
    }

    document.getElementById("blogTitle").value = "";
    document.getElementById("blogContent").value = "";
    renderBlogs();
  } catch (err) {
    console.error(err);
    alert("Error saving blog.");
  }
}

let blogIds = [];

async function renderBlogs() {
  try {
    const res = await fetch(`${BASE_URL}/blogs`);
    const blogs = await res.json();
    const blogList = document.getElementById("blogList");
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    blogList.innerHTML = "";
    blogIds = [];

    blogs.forEach((blog, index) => {
      if (
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        blog.author.toLowerCase().includes(searchTerm)
      ) {
        blogIds.push(blog._id);
        const div = document.createElement("div");
        div.className = "bg-gray-800 p-4 rounded mb-4";
        div.innerHTML = `
          <h3 class="text-xl font-semibold">${blog.title}</h3>
          <p class="text-sm mb-2">by ${blog.author}</p>
          <p>${blog.content}</p>
          ${
            blog.author === currentUser
              ? `<div class="mt-2 flex gap-2">
                  <button onclick="editBlog(${blogIds.length - 1})" class="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded">Edit</button>
                  <button onclick="deleteBlog(${blogIds.length - 1})" class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Delete</button>
                </div>`
              : ""
          }
        `;
        blogList.appendChild(div);
      }
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load blogs.");
  }
}

async function editBlog(index) {
  const blogId = blogIds[index];
  const res = await fetch(`${BASE_URL}/blogs`);
  const blogs = await res.json();
  const blog = blogs.find(b => b._id === blogId);
  document.getElementById("blogTitle").value = blog.title;
  document.getElementById("blogContent").value = blog.content;
  editIndex = index;
}

async function deleteBlog(index) {
  const blogId = blogIds[index];
  await fetch(`${BASE_URL}/blogs/${blogId}`, {
    method: "DELETE"
  });
  renderBlogs();
}

// Initial load
if (currentUser) showBlogPage();
else document.getElementById("loginPage").classList.remove("hidden");
