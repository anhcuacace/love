import { useNavigate } from "react-router-dom";

import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Polaroid } from "../../common/Polaroid";
import { SectionTitle } from "../../common/SectionTitle";
import { StickyNote } from "../../common/StickyNote";
import { PageContainer } from "../../layout/PageContainer";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="404">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="404"
          title="Không tìm thấy trang này"
          subtitle="Có thể bạn gõ sai đường dẫn hoặc trang đã được đổi vị trí."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card
            title="Đi tiếp theo"
            description="Chọn một lối đi an toàn để quay lại album."
            actions={
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Quay lại
              </Button>
            }
          >
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" to="/">
                Về trang chủ
              </Button>
              <Button variant="secondary" to="/board">
                Mở bảng scrapbook
              </Button>
              <Button variant="secondary" to="/settings">
                Cài đặt
              </Button>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Tip: nếu bạn vừa dán link từ ai đó, hãy kiểm tra lại phần sau dấu “/”.
            </p>
          </Card>

          <div className="space-y-6">
            <Polaroid
              src="/main.jpg"
              alt="Ảnh kỷ niệm"
              caption="Lạc đường chút thôi…"
              meta="Nhưng vẫn có chúng ta."
              showTape
              loading="lazy"
            />
            <StickyNote eyebrow="Ghi chú" title="Gợi ý nhanh" variant="lemon" tilt="right">
              <p>
                Menu ở phía trên vẫn hoạt động. Bạn có thể ghé “Hành trình”, “Album” hoặc “Thư” để
                tiếp tục khám phá.
              </p>
            </StickyNote>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

