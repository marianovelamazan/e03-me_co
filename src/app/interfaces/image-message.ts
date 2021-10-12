export interface ImageMessage {
}

export interface MyImage {
    name: string;
    filepath: string;
    size: number;
    chatId: string;
    
  }
  
export interface MyData {
    name: string;
    filepath: string;
    size: number;
    chatId: string;
  }

  export interface MyUser {
    name: string;
    displayName: string;
    uid: number;
    chatId: string;
  }

  export interface Emotion {
    chatid: string;
    count: number;
    createdAt: number;
    opinions: {
      id: number;
      type: string;
      emotion: string;
      valence: string,
      description: string,
      answer: string,
      selected: boolean,
      color: string,
      icon: string,
      createdAt: number;    
      uid: string;
      value: number;
      
    }[];
    uid: string;
  }

  export interface Reflection {
    chatid: string;
    count: number;
    createdAt: number;
    opinions: {
      cardid: number;
      content: string;
      createdAt: number;
      type: string;
      uid: string;
      value: number;
    }[];
    uid: string;
  }