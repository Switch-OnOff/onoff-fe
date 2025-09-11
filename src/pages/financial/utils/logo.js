// src/utils/logo.js
// 모든 로고 파일을 glob으로 불러오기
const logoFiles = import.meta.glob('@/assets/icons/financial/logo/*', {
  eager: true,
  as: 'url',
});
const logoByName = {};
for (const path in logoFiles) {
  const file = path.split('/').pop(); // ex) KB.png
  logoByName[file] = logoFiles[path];
}

// 매핑 테이블
const logoMap = {
  롯데: '롯데.png',
  리딩: '리딩.png',
  메리츠: '메리츠.png',
  볼보: '볼보.png',
  산은: '산은.png',
  아이엠: '아이엠.png',
  애큐온: '애큐온.png',
  오릭스: '오릭스.png',
  우리: '우리.png',
  코스모: '코스모.png',
  트라톤: '트라톤.png',
  하나: '하나.png',
  한국캐피탈: '한국캐피탈.png',
  한국투자: '한국투자캐피탈.png',
  현대: '현대.png',
  BMW: 'BMW.png',
  BNK: 'BNK.png',
  JB우리: 'JB우리캐피탈.png',
  KB: 'KB.png',
};

export function getLogoSrc({ mode, loanCompany }) {
  if (mode === 'support') {
    return logoByName['logo_gov.png'] || null;
  }
  if (mode === 'loan' && loanCompany) {
    const key = Object.keys(logoMap).find((k) => loanCompany.includes(k));
    if (key) return logoByName[logoMap[key]] || null;
  }
  return null;
}
