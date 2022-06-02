import sys
import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.orm import Session
from tests.test_000_main import Acc
from util.mailer import MailTypeEnum

sys.path.append("..")

account = Acc(email="support@akvo.org", token=None)

n_sa_sb = MailTypeEnum.notify_submission_completed_to_secretariat_admin


class TestEmailTemplate():
    @pytest.mark.asyncio
    async def test_get_email_template(self, app: FastAPI, session: Session,
                                      client: AsyncClient) -> None:
        # register
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.register.value})
        assert res.status_code == 200
        # email register to member admin
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.register_to_member.value})
        assert res.status_code == 200
        # invitation
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.invitation.value})
        assert res.status_code == 200
        # verify email
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.verify_email.value})
        assert res.status_code == 200
        # reset_password
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.reset_password.value})
        assert res.status_code == 200
        # user_approved
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.user_approved.value})
        assert res.status_code == 200
        # data download request
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.data_download_requested.value})
        assert res.status_code == 200
        # data download approved
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.data_download_approved.value})
        assert res.status_code == 200
        # add collaborator
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.add_collaborator.value})
        assert res.status_code == 200
        # notify secretariat admin when submission is successfully made
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": n_sa_sb.value})
        assert res.status_code == 200
        # otp code
        res = await client.get(
            app.url_path_for("template:email"),
            params={"type": MailTypeEnum.otp_code.value})
        assert res.status_code == 200
