// import React, { useState } from "react";
// import styled from "styled-components";
// import LogoImage from "../utils/Images/Logo3.png";
// import AuthImage from "../utils/Images/AuthImage2.jpg";
// import SignIn from "../components/SignIn";
// import SignUp from "../components/SignUp";

// const Container = styled.div`
//   flex: 1;
//   height: 100%;
//   display: flex;
//   background: ${({ theme }) => theme.bg};
//   @media (max-width: 700px) {
//     flex-direction: column;
//   }
// `;
// const Left = styled.div`
//   flex: 1;
//   position: relative;
//   @media (max-width: 700px) {
//     display: none;
//   }
// `;
// const Logo = styled.img`
//   position: absolute;
//   width: 70px;
//   top: 40px;
//   left: 60px;
//   z-index: 10;
// `;
// const Image = styled.img`
//   position: relative;
//   height: 100%;
//   width: 100%;
//   object-fit: cover;
// `;

// const Right = styled.div`
//   flex: 1;
//   position: relative;
//   display: flex;
//   flex-direction: column;
//   padding: 40px;
//   gap: 16px;
//   align-items: center;
//   justify-content: center;
// `;

// const Text = styled.div`
//   font-size: 16px;
//   text-align: center;
//   color: ${({ theme }) => theme.text_secondary};
//   margin-top: 16px;
//   @media (max-width: 400px) {
//     font-size: 14px;
//   }
// `;
// const TextButton = styled.span`
//   color: ${({ theme }) => theme.primary};
//   cursor: pointer;
//   transition: all 0.3s ease;
//   font-weight: 600;
// `;

// const Authentication = () => {
//   const [login, setLogin] = useState(false);
//   return (
//     <Container>
//       <Left>
//         <Logo src={LogoImage} />
//         <Image src={AuthImage} />
//       </Left>
//       <Right>
//         {!login ? (
//           <>
//             <SignIn />
//             <Text>
//               Don't have an account?{" "}
//               <TextButton onClick={() => setLogin(true)}>SignUp</TextButton>
//             </Text>
//           </>
//         ) : (
//           <>
//             <SignUp />
//             <Text>
//               Already have an account?{" "}
//               <TextButton onClick={() => setLogin(false)}>SignIn</TextButton>
//             </Text>
//           </>
//         )}
//       </Right>
//     </Container>
//   );
// };

// export default Authentication;


import React, { useState } from "react";
import styled from "styled-components";
import LogoImage from "../utils/Images/Logo3.png";
import AuthImage from "../utils/Images/AuthImage2.jpg";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(${AuthImage}) no-repeat center center/cover;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Dark overlay for contrast */
`;

const FormContainer = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0); /* Transparent white background */
  backdrop-filter: blur(10px); /* Frosted glass effect */
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
`;

const Logo = styled.img`
  width: 80px;
  margin-bottom: 20px;
`;

const Text = styled.div`
  font-size: 16px;
  text-align: center;
  color: white;
  margin-top: 16px;
  @media (max-width: 400px) {
    font-size: 14px;
  }
`;
const TextButton = styled.span`
  color: #ffcc00;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  &:hover {
    color: #ffd700;
  }
`;

const Authentication = () => {
  const [login, setLogin] = useState(false);
  return (
    <Container>
      <Overlay />
      <FormContainer>
        <Logo src={LogoImage} />
        {!login ? (
          <>
            <SignIn />
            <Text>
              Don't have an account? <TextButton onClick={() => setLogin(true)}>SignUp</TextButton>
            </Text>
          </>
        ) : (
          <>
            <SignUp />
            <Text>
              Already have an account? <TextButton onClick={() => setLogin(false)}>SignIn</TextButton>
            </Text>
          </>
        )}
      </FormContainer>
    </Container>
  );
};

export default Authentication;
