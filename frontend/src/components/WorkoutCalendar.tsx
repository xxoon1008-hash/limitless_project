// components/WorkoutCalendar.tsx 예시
import { Calendar } from "react-native-calendars";

export default function WorkoutCalendar({
  attendanceDates,
  onDayPress,
  selectedDate,
}: any) {
  // 출석 날짜들을 달력에 표시할 데이터로 변환
  const markedDates = attendanceDates.reduce((acc: any, date: string) => {
    acc[date] = { selected: true, selectedColor: "#4CAF50" };
    return acc;
  }, {});

  // 현재 선택된 날짜 원형 테두리 표시 (출석한 날이면 초록색 유지)
  if (selectedDate) {
    const isAttended = attendanceDates.includes(selectedDate);
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: isAttended ? "#4CAF50" : "#FF5252",
    };
  }

  return (
    <Calendar
      theme={{
        backgroundColor: "transparent",
        calendarBackground: "transparent",
        textSectionTitleColor: "#ffffff",
        selectedDayBackgroundColor: "#FF5252",
        selectedDayTextColor: "#ffffff",
        todayTextColor: "#FF5252",
        dayTextColor: "#ffffff",
        textDisabledColor: "#444",
        monthTextColor: "#ffffff",
        arrowColor: "#FF5252",
      }}
      onDayPress={onDayPress}
      markedDates={markedDates}
    />
  );
}
