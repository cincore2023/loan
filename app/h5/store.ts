// 简单的状态存储，支持本地存储持久化
class H5Store {
  private data: any = {};
  
  constructor() {
    // 从本地存储初始化数据
    this.loadFromLocalStorage();
  }
  
  // 从本地存储加载数据
  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem('h5Store');
        if (storedData) {
          this.data = JSON.parse(storedData);
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
        this.data = {};
      }
    }
  }
  
  // 将数据保存到本地存储
  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('h5Store', JSON.stringify(this.data));
      } catch (error) {
        console.error('Failed to save data to localStorage:', error);
      }
    }
  }
  
  setData(key: string, value: any) {
    this.data[key] = value;
    this.saveToLocalStorage();
  }
  
  getData(key: string) {
    return this.data[key];
  }
  
  clearData(key: string) {
    delete this.data[key];
    this.saveToLocalStorage();
  }
  
  clearAll() {
    this.data = {};
    this.saveToLocalStorage();
  }
}

export const h5Store = new H5Store();