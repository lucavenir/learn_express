export interface CreateTweetParams {
   text: string;
   replyId?: string;
   quoteId?: string;
}

export interface Tweet {
   id: string;
   userId: string;
   replyId?: string;
   quoteId?: string;
   attachmentId?: string;
   text: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface Like {
   id: string;
   userId: string;
   postId: string;
}
