import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Fragment } from 'react';

export default function TutorialDialog({ openDialog, handleCloseDialog }) {
  return (
    <Fragment>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>新手教學</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            歡迎來到 Fridge Chef！
            <br />
            初次使用請先點擊【 個人檔案 】
            <br />
            <br />
            請在個人檔案目錄點擊【 編輯喜好 】➤
            編輯你的飲食習慣並新增您想要在食譜推薦時排除的食材。
            <br />
            接著點擊【 新增冰箱 】➤
            輸入您的冰箱名稱及描述，再選出和您一起共用冰箱的成員（成員需先註冊）。新成員將從
            Email 或網站通知點擊連結，接受您的邀請。
            <br />
            <br />【 新增冰箱
            】成功後，請將您擁有的食材加入食材清單，完成後選擇您要生成的食譜種類，按下【
            推薦食譜 】按鈕，最適合您的食譜將顯示於【 食譜推薦清單 】。
            <br />
            <br />
            Note ► 若將成員卡片方格打勾，推薦食譜時會將該成員的【 排除食材
            】加以排除。
            <br />
            <br />
            其他功能就留給您去探索了。
            <br />
            Fridge Chef 團隊再次歡迎您的加入！
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ fontSize: 17, mr: 1 }}>
            OK!
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
