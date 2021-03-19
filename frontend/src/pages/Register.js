import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import WelcomeBanner from "../components/WelcomeBanner";
import useForm from "../lib/use-form";
import { useAuth } from "../components/auth-context";
import { useAuth0 } from "@auth0/auth0-react";
import authApi from "../services/auth";
import config from "../config";
import Select from "react-select";
import { uiText } from "../static/ui-text";
import { useLocale } from "../lib/locale-context";
import { wfc } from "../static/webform-content";
import { dsc } from "../static/data-security-content";
import { ModalDataSecurity } from "../components/Modal";

const RegisterForm = ({ text, content, setRegistered, organizations }) => {
    const {
        register,
        handleSubmit,
        errors,
        setServerErrors,
        reset,
        watch
    } = useForm();

    const [selectedOrgs, setSelectedOrgs] = useState({value:false, label:"", error: false});
    const password = useRef({});
    password.current = watch("password", "");

    const onSubmit = async data => {
        if (!selectedOrgs.value) {
            setSelectedOrgs({ ...selectedOrgs, error: true});
            return;
        }
        data = { ...data, organization_id: selectedOrgs.value };
        try {
            await authApi.register(data);
          setRegistered(true);
//          window.location.replace('./login');
//            reset();
        } catch (e) {
            if (e.status === 422) {
                setServerErrors(e.errors);
            } else {
                throw e;
            }
        }
    };

    const renderOrganizations = organizations => {
        return organizations.map(x => {
            return { value: x.id, label: x.name };
        });
    };

    return (
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="formBasicFulltName">
                <Form.Label>{ text.formFullName }</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    placeholder={ text.formFullName }
                    isInvalid={!!errors.name}
                    ref={register({
                        required: text.valFullName
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {!!errors.name && errors.name.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>{ text.formEmail }</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    placeholder={ text.formEmail }
                    isInvalid={!!errors.email}
                    ref={register({
                        required: text.valEmail
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {!!errors.email && errors.email.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                    { text.formEmailText }
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="formBasicOrganization">
                <Form.Label>{ text.tbColOrganization }</Form.Label>
                <Select
                    onChange={opt => setSelectedOrgs(opt)}
                    options={renderOrganizations(organizations)}
                />
                { selectedOrgs.error ? (
                    <Form.Text className="text-danger">
                        { text.valOrganization }
                    </Form.Text>
                    ) : ""}
            </Form.Group>
            <Form.Group controlId="formBasicCheckbox">
                <Form.Check
                    type="checkbox"
                    name="agreement"
                    label={ content.registerCheckBoxText }
                    // isInvalid={!!errors.agreement}
                    ref={register({
                        required: text.valRegisterCheckBox
                    })}
                />
                {!!errors.agreement &&
                        errors.agreement.message ?
                            <Form.Text className="text-danger" style={{paddingLeft:"1.2rem"}}>
                                {errors.agreement.message}
                            </Form.Text>
                        : ""}
            </Form.Group>
            <Row>
                <Col md={12}>
                    <Button type="submit">{ text.formRegister }</Button>
                </Col>
            </Row>
        </Form>
    );
};

const RegisteredBanner = ({ text }) => {
    useEffect(() => {
//        setTimeout(() => window.location.reload(), 10000);
    }, []);

    return <div>{ text.valRegisterSuccess } ... check your email to verify it</div>;
};

const Register = () => {
    const [registered, setRegistered] = useState(false);
    const [orgs, setOrgs] = useState([]);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const { locale } = useLocale();
    let text = uiText[locale.active];
    let content = wfc(handleShow)[locale.active];

    useEffect(async () => {
        try {
            let res = await authApi.getOrganizations();
            setOrgs(res.data);
        } catch (e) {
            throw e;
        }
    }, []);
  const { loginWithRedirect } = useAuth0();
    return (
        <>
            <WelcomeBanner />
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header>{ text.formRegister }</Card.Header>
                            <Card.Body>
                                {registered ? (
                                    <RegisteredBanner text={text} />
                                ) : (
                                    <RegisterForm
                                        text={text}
                                        content={content}
                                        setRegistered={setRegistered}
                                        organizations={orgs}
                                    />
                                )}
                            </Card.Body>
                            {!registered && (
                                <Card.Footer>
                                    { text.formHaveAccount }
<Button onClick={() => loginWithRedirect()} variant="link"
>{ text.formLogin }</Button>
                                </Card.Footer>
                            )}
                        </Card>
                    </Col>
                </Row>

                <ModalDataSecurity
                    text={text}
                    show={show}
                    handleClose={handleClose}
                    locale={locale}
                    data={dsc}
                />
            </Container>
        </>
    );
};

export default Register;
