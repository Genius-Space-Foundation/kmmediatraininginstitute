# How to Access Trainer Functionality

## 🎯 **Step-by-Step Guide**

### **1. Access Trainer Dashboard**

1. **Login as a Trainer**: Use a trainer account to log in
2. **Navigate to Dashboard**: Go to `/trainer` or click on trainer dashboard
3. **View Your Courses**: You should see a list of courses assigned to you

### **2. Access Course Management**

1. **Find a Course**: In the trainer dashboard, locate a course you want to manage
2. **Click "Manage" Button**: Look for the "Manage" button (purple button with clipboard icon)
3. **This will take you to**: `/trainer/courses/{courseId}/manage`

### **3. Course Management Interface**

Once you're in the course management interface, you'll see:

#### **Header Section**

- **Course Management** title
- **Add Material** button (blue)
- **Add Assignment** button (green)

#### **Navigation Tabs**

- **Course Materials** tab - shows existing materials
- **Assignments** tab - shows existing assignments

### **4. Upload Course Materials**

1. **Click "Add Material"** button
2. **Fill out the form**:
   - Title (required)
   - Description (optional)
   - File Type (PDF, Video, Document, Image, Link)
   - Upload file (drag & drop or click to select)
   - Module (optional - e.g., "Module 1")
3. **Click "Upload Material"**

### **5. Create Assignments**

1. **Click "Add Assignment"** button
2. **Fill out the form**:
   - Title (required)
   - Description (required)
   - Due Date (required)
   - Max Score (default: 100)
   - Assignment Type (Individual or Group)
   - Instructions (optional)
   - Attachment (optional)
3. **Click "Create Assignment"**

## 🔧 **Testing the Functionality**

### **Backend Test Results**

```
✅ Trainer: John Trainer
✅ Course: Sound Engineering
✅ Course Materials: 4 materials
✅ Assignments: 3 assignments
✅ Sample material creation: Successful
✅ Sample assignment creation: Successful
```

### **Frontend Components Available**

- ✅ `TrainerCourseManagement.tsx` - Main management interface
- ✅ `MaterialUploadModal.tsx` - Material upload modal
- ✅ `AssignmentCreationModal.tsx` - Assignment creation modal
- ✅ `TrainerCourseView.tsx` - Alternative course view

### **Routes Configured**

- ✅ `/trainer/courses/:id` - Trainer course view
- ✅ `/trainer/courses/:courseId/manage` - Course management
- ✅ `/trainer/courses/:courseId/edit` - Course editing

## 🎨 **What You Should See**

### **Course Materials Tab**

- List of uploaded materials
- File type icons (PDF, Video, etc.)
- Download buttons
- Edit/Delete options
- File size and module information

### **Assignments Tab**

- List of created assignments
- Due dates and max scores
- Assignment types (Individual/Group)
- Download attachment buttons
- Edit/Delete options

### **Upload Modals**

- Clean, modern interface
- Drag-and-drop file upload
- Form validation
- Progress indicators
- Success/error messages

## 🚨 **Troubleshooting**

### **If you can't see the changes:**

1. **Check Browser Console**: Look for any JavaScript errors
2. **Verify Login**: Make sure you're logged in as a trainer
3. **Check Network Tab**: Ensure API calls are successful
4. **Clear Cache**: Try refreshing the page or clearing browser cache

### **If buttons don't work:**

1. **Check Authentication**: Ensure you have trainer permissions
2. **Verify Routes**: Make sure the routes are properly configured
3. **Check API Endpoints**: Ensure backend is running and accessible

### **If uploads fail:**

1. **Check File Size**: Materials max 50MB, Assignments max 10MB
2. **Check File Type**: Ensure file format is supported
3. **Check Network**: Ensure stable internet connection

## 📱 **Supported File Types**

### **Course Materials**

- PDF, DOC, DOCX, TXT
- JPG, JPEG, PNG, GIF
- MP4, AVI, MOV
- Links (URLs)

### **Assignment Attachments**

- PDF, DOC, DOCX, TXT
- JPG, JPEG, PNG, GIF

## 🔐 **Access Control**

- **Trainer Routes**: Protected with `TrainerRoute` middleware
- **API Endpoints**: Role-based access control
- **Course Access**: Only assigned courses are accessible

## 📞 **Need Help?**

If you're still having issues:

1. **Check the browser console** for error messages
2. **Verify your user role** is set to "trainer"
3. **Ensure you have courses assigned** to your trainer account
4. **Check that the backend server** is running properly

The functionality has been fully implemented and tested. All components are in place and the routes are properly configured.
