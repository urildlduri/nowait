# NOWAIT — 프로젝트 현황 (v3.0)

위치 기반 실시간 빈자리 매칭 플랫폼. "지금, 바로 갈 수 있는 곳"

배포: https://urildlduri.github.io/nowait/
저장소: github.com/urildlduri/nowait

---

## 파일 구성
- `index.html` — 스플래시 + 구글 로그인 + 역할 자동 분기 (라우터)
- `user.html` — 사용자 앱 (호출/상세/매칭/MY/파트너신청/핫플)
- `merchant.html` — 매장 콘솔 (실시간 호출/응답/도착예정/매장수정)
- `admin.html` — 관리자 (파트너 승인·삭제, 핫플 관리, 모니터링, 데모생성)
- `nw-core.js` — 공통 코어 (Firebase config, 로그인, 위치, 지도, 상수)
- `nw.css` — 공통 스타일 (디스패치 콘솔 톤: 노랑/다크)
- `firestore.rules` — 보안 규칙 (Firebase 콘솔에 게시, GitHub엔 불필요)
- `BACKLOG.md` — 나중에 할 일 (Blaze 필요 항목)

## 외부 연동
- Firebase: 프로젝트 `nowait-84116` / 구글 로그인 + Firestore
- 카카오맵 JS 키: `56d96a0427d001e4d5fd597bd5e458e0` (지도·길찾기·주소검색)
- 관리자: `urildlduri@gmail.com`

## Firestore 컬렉션
- `nw_users/{uid}` — 프로필, role, penaltyUntil + history 서브컬렉션
- `nw_biz/{id}` — 매장 (approved 플래그, ownerId, 위치, 메뉴, minParty 등)
- `nw_calls/{id}` — 호출 (status, cat, party, 위치, expiresAt) + responses 서브컬렉션
- `nw_hotplaces/{id}` — 관리자 등록 핫플

## 핵심 흐름
1. 구글 로그인 → 역할 자동 분기 (관리자/매장/사용자)
2. 사용자: 인원·업종·위치 → 호출(60초) → 매장 응답 실시간 수신
3. 매장 상세(지도·메뉴·길찾기) → "여기로 갈게요" → 매칭(15분 카운트다운)
4. 도착완료 / 노쇼(30분 패널티)
5. 매장: 파트너 신청 → 관리자 승인 → 콘솔에서 1탭 응답

## 업종 (9종)
술집·노래방·방탈출·스크린골프·파티룸·숙박·마사지·보드카페·PC방

## 알려진 한계 (BACKLOG.md 참고 — Blaze 전환 시 해결)
- 매칭 후 노쇼 타이머는 사용자 화면 떠 있을 때만 작동 (서버 필요)
- 만료 호출 자동 정리 없음 (관리자 수동 정리로 대체)
- POS 연동, 선입금/결제, 노쇼 신뢰점수, FCM 푸시 — 미구현

## 테스트 방법
1. 관리자 로그인 → "데모 매장 3개 생성"
2. "사용자 앱 미리보기" → 술집/노래방/방탈출 중 호출
3. 데모 매장 자동응답(1~3초) → 상세 → 매칭

---
v3.0 / 2026-05-27 정리 완료
