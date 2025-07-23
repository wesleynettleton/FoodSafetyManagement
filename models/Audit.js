const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  id: String,
  name: String,
  data: String, // Base64 encoded image data
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const auditItemSchema = new mongoose.Schema({
  itemIndex: Number,
  checked: Boolean, // true for Yes, false for No, undefined for not answered
  notes: String,
  photos: [photoSchema]
});

const auditSectionSchema = new mongoose.Schema({
  sectionId: String,
  sectionTitle: String,
  items: [auditItemSchema]
});

const auditSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  auditor: {
    type: String,
    required: true
  },
  auditDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'completed'],
    default: 'draft'
  },
  sections: [auditSectionSchema],
  
  // Calculated fields for easy querying
  totalItems: {
    type: Number,
    default: 55 // Total number of audit items across all sections
  },
  completedItems: Number, // Items that have been answered (Yes or No)
  compliantItems: Number, // Items answered as Yes
  nonCompliantItems: Number, // Items answered as No
  score: Number, // Percentage of compliant items out of answered items
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
auditSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for efficient sorting and querying
auditSchema.index({ auditDate: -1 });
auditSchema.index({ location: 1, auditDate: -1 });
auditSchema.index({ status: 1 });
auditSchema.index({ createdBy: 1, auditDate: -1 });
auditSchema.index({ location: 1, status: 1, auditDate: -1 });

// Method to calculate compliance statistics
auditSchema.methods.calculateStats = function() {
  let totalItems = 0;
  let completedItems = 0;
  let compliantItems = 0;
  let nonCompliantItems = 0;

  this.sections.forEach(section => {
    section.items.forEach(item => {
      totalItems++;
      if (item.checked !== undefined) {
        completedItems++;
        if (item.checked === true) {
          compliantItems++;
        } else {
          nonCompliantItems++;
        }
      }
    });
  });

  this.totalItems = totalItems;
  this.completedItems = completedItems;
  this.compliantItems = compliantItems;
  this.nonCompliantItems = nonCompliantItems;
  this.score = completedItems > 0 ? Math.round((compliantItems / completedItems) * 100) : 0;
};

module.exports = mongoose.model('Audit', auditSchema); 