import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import WelcomeBanner from "../components/WelcomeBanner";
import { useAuth } from "../components/auth-context";
import { Link } from "react-router-dom";
import useForm from "../lib/use-form";
import config from "../config";
import { uiText } from "../static/ui-text";
import { useLocale } from "../lib/locale-context";
import { useAuth0 } from "@auth0/auth0-react";
const Login = () => {
  console.log('Login!');
    const history = useHistory();
    const { login } = useAuth();
    const {
        setValue,
        setServerErrors
    } = useForm();

    const { locale } = useLocale();
    let text = uiText[locale.active];

    // const setCache = () => {
    //     // set login time
    //     const now = new Date();
    //     let cache_version = document.getElementsByName("cache-version")[0].getAttribute("value");
    //     localStorage.clear();
    //     localStorage.setItem("cache-time", now.getTime());
    //     localStorage.setItem("cache-version", cache_version);
    // };


  const { loginWithRedirect } = useAuth0();
    return (
        <>
            <WelcomeBanner />
            <Container className="loginPg">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card>
                            <Card.Header>{ text.formLogin }</Card.Header>
        <Card.Body><Button onClick={() => loginWithRedirect()}>{ text.formLogin }</Button></Card.Body>
                                    <Card.Footer>
                                { text.formDontHaveAccount }
                                <Link to="/register" className="ml-2">
                                    { text.formRegister }
                                </Link>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Login;
