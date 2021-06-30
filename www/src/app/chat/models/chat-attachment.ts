export class ChatAttachment {
  id: number;
  type:	"image" | "file";
  originalFilename:	string;
  md5: string;
  size: number;
  createdAt: string;
}
