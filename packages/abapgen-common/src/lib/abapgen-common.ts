export class $comment {
  static readonly before: unique symbol = Symbol();
  static readonly after: unique symbol = Symbol();
}

export interface has_comments {
  [$comment.before]?: string;
  [$comment.after]?: string;
}