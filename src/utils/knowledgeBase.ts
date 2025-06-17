import knowledgeBaseData from '@/data/knowledge-base.json';

export class KnowledgeBase {
  private static instance: KnowledgeBase;
  private data: any;

  private constructor() {
    this.data = knowledgeBaseData;
  }

  public static getInstance(): KnowledgeBase {
    if (!KnowledgeBase.instance) {
      KnowledgeBase.instance = new KnowledgeBase();
    }
    return KnowledgeBase.instance;
  }

  // Search through the knowledge base
  public search(query: string): string | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Search through all categories and subcategories
    for (const category in this.data.categories) {
      for (const subcategory in this.data.categories[category]) {
        const entries = this.data.categories[category][subcategory];
        for (const entry of entries) {
          if (entry.question.toLowerCase().includes(normalizedQuery)) {
            return entry.answer;
          }
        }
      }
    }
    return null;
  }

  // Add a new entry to the knowledge base
  public addEntry(category: string, subcategory: string, question: string, answer: string): void {
    if (!this.data.categories[category]) {
      this.data.categories[category] = {};
    }
    if (!this.data.categories[category][subcategory]) {
      this.data.categories[category][subcategory] = [];
    }
    this.data.categories[category][subcategory].push({
      question,
      answer
    });
  }

  // Get all entries in a specific category and subcategory
  public getEntries(category: string, subcategory: string): any[] {
    return this.data.categories[category]?.[subcategory] || [];
  }
}
