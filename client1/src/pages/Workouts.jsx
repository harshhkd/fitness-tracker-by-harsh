import React, { useEffect, useState } from "react";
import styled from "styled-components";
import WorkoutCard from "../components/cards/WorkoutCard";
import AddWorkout from "../components/AddWorkout";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import { getWorkouts, addWorkout } from "../api";
import { CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
`;

const Wrapper = styled.div`
  flex: 1;
  max-width: 1600px;
  display: flex;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
    flex-direction: column;
  }
`;

const Left = styled.div`
  flex: 0.2;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DateSection = styled.div`
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.primary};
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const Right = styled.div`
  flex: 1;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 100px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 22px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const SecTitle = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;

const Workouts = () => {
  const dispatch = useDispatch();
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [workout, setWorkout] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  const getTodaysWorkout = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    
    try {
      // Fix the API call to use query parameters correctly
      const res = await getWorkouts(token, date);
      setTodaysWorkouts(res?.data?.todaysWorkouts || []);
      console.log("Fetched workouts:", res.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      alert("Failed to fetch workouts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addNewWorkout = async () => {
    if (!workout.trim()) {
      alert("Please enter workout details.");
      return;
    }
    
    setButtonLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    
    try {
      // Format the workout data CORRECTLY according to your server's expectations
      const workoutData = {
        workoutString: workout,
        date: date || new Date().toISOString().split('T')[0]
      };
      
      console.log("Sending workout data:", workoutData);
      
      const res = await addWorkout(token, workoutData);
      console.log("Workout added successfully:", res.data);
      
      // Clear the workout input
      setWorkout("");
      
      // Refresh the workouts list
      getTodaysWorkout();
      
      // Show success message
      alert("Workout added successfully!");
    } catch (error) {
      console.error("Error adding workout:", error);
      
      // Show detailed error message
      if (error.response) {
        console.log("Error response:", error.response);
        alert(`Failed to add workout: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        alert("Server didn't respond. Please check your connection.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    getTodaysWorkout();
  }, [date]);

  return (
    <Container>
      <Wrapper>
        <Left>
          <DateSection>
            <Title>Select Date</Title>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                onChange={(e) => {
                  // Format date as YYYY-MM-DD
                  const formattedDate = `${e.$y}-${String(e.$M + 1).padStart(2, '0')}-${String(e.$D).padStart(2, '0')}`;
                  console.log("Selected date:", formattedDate);
                  setDate(formattedDate);
                }}
              />
            </LocalizationProvider>
          </DateSection>
          
          {/* Add the AddWorkout component here */}
          <AddWorkout 
            workout={workout}
            setWorkout={setWorkout}
            addNewWorkout={addNewWorkout}
            buttonLoading={buttonLoading}
          />
        </Left>
        <Right>
          <Section>
            <SecTitle>Today's Workout</SecTitle>
            {loading ? (
              <CircularProgress />
            ) : (
              <CardWrapper>
                {todaysWorkouts && todaysWorkouts.length > 0 ? (
                  todaysWorkouts.map((workout, index) => (
                    <WorkoutCard key={index} workout={workout} />
                  ))
                ) : (
                  <p>No workouts found for this date.</p>
                )}
              </CardWrapper>
            )}
          </Section>
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Workouts;
