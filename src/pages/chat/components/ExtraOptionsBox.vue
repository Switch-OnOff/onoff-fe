  <template>
    <transition name="slide-fade">
      <div v-if="visible" class="extra-box">
        <div class="img-wrapper" @click="handleSelectAlbum">
          <div class="img-box"><img src="@/assets/icons/chat/gallery.png" /></div>
          <label class="bodySemiBold12px">앨범</label>
        </div>
        <div class="img-wrapper" @click="handleSelectCamera">
          <div class="img-box"><img src="@/assets/icons/chat/camera.png" /></div>
          <label class="bodySemiBold12px">카메라</label>
        </div>
      </div>
    </transition>
  </template>

  <script setup>
  defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
  });

  // ❌ emit 정의가 더 이상 필요 없습니다.

  /**
   * '앨범' 아이콘 클릭 시 실행될 함수
   */
  const handleSelectAlbum = () => {
    console.log('앨범 선택 기능 실행');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        console.log('선택된 파일:', files);
        // 여기서 바로 파일 처리 로직을 수행합니다.
        // 예: uploadFiles(files);
      }
    };
    input.click();
  };

  /**
   * '카메라' 아이콘 클릭 시 실행될 함수
   */
  const handleSelectCamera = () => {
    console.log('카메라 실행 기능 실행');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        console.log('촬영된 사진 파일:', files[0]);
      }
    };
    input.click();
  };
  </script>

  <style scoped>
  .extra-box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px 10px;
    justify-items: center;
    padding: 8px 4px 16px 4px;
    height: 280px;
  }

  .img-wrapper {
    text-align: center;
  }

  .img-box {
    width: 30px;
    height: 30px;
    background-color: #f4f4f4;
    border-radius: 50rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.8rem;
  }

  .img-box > img {
    width: 30px;
    height: 30px;
  }

  /* 애니메이션 */
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
  </style>
