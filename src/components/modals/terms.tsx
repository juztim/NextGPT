import { Modal, ModalBody, ModalTitle } from "react-bootstrap";

const TermsModal = ({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <ModalTitle>Terms & Conditions</ModalTitle>
      </Modal.Header>
      <ModalBody>
        <p>
          Welcome to FutureDesk&apos;s Services. These Terms and Conditions
          (&qout;Terms&qout;) govern your access to and use of our prompts,
          chats, and generators (the &qout;Services&qout;). By accessing or
          using the Services, you agree to be bound by these Terms. If you do
          not agree to all of the Terms, then you may not access or use the
          Services.
        </p>
        <p>
          Eligibility: To access or use the Services, you must be at least 13
          years old. By accessing or using the Services, you represent and
          warrant that you are at least 13 years old and have the right,
          authority, and capacity to enter into these Terms.
        </p>
        <p>
          Use of Services: You may only use the Services for lawful purposes and
          in accordance with these Terms. You may not use the Services in any
          way that violates applicable law or regulations. You may not use the
          Services in any manner that could damage, disable, overburden, or
          impair any FutureDesk server or network connected to any FutureDesk
          server. You may not attempt to gain unauthorized access to any
          Service, other accounts, computer systems, or networks connected to
          any FutureDesk server or to any of the Services through hacking,
          password mining, or any other means.
        </p>
        <p>
          Fees: The fees for using the Services will be set forth on our website
          and are subject to change from time to time without notice. All fees
          are non-refundable unless otherwise stated in writing by FutureDesk.
        </p>
        <p>
          Termination: FutureDesk reserves the right to terminate your access to
          all or any part of the Services at any time without notice for any
          reason whatsoever, including but not limited to breach of these Terms.
          Upon termination of your account for any reason whatsoever, all rights
          granted to you under these Terms shall immediately cease, and you must
          immediately stop using the Services.
        </p>
        <p>
          Disclaimer of Warranties: The Services are provided &qout;as is&qout;
          without warranty of any kind, either express or implied, including but
          not limited to warranties of merchantability, fitness for a particular
          purpose, and non-infringement. FutureDesk does not make any warranties
          regarding accuracy, reliability, or quality of any content obtained
          through the Services.
        </p>
        <p>
          Limitation of Liability: In no event shall FutureDesk be liable for
          damages resulting from your use of the Services, including but not
          limited to direct, indirect, incidental, punitive, and consequential
          damages, even if FutureDesk has been advised of such possibility.
        </p>
        <p>
          Indemnification: You agree to indemnify and hold harmless FutureDesk
          from all claims arising out of your use of the Services, including but
          not limited to claims made by third parties related to infringement of
          intellectual property rights or violation of applicable laws and
          regulations related thereto.
        </p>
        <p>
          Privacy Policy: By using our site, you agree to the terms of our
          Privacy Policy, which can be found on our website.
        </p>
        <p>
          Intellectual Property: FutureDesk respects intellectual property
          rights and wants to foster innovation. Due to the emerging nature of
          the technology, we have implemented a unique intellectual property
          arrangement with our users.
        </p>
        <p>
          Regular Restrictions: All branding, graphics, logos, designs, and
          other content displayed on FutureDesk.io are the sole property of
          FutureDesk and may not be used without express written permission. Any
          unauthorized use of our intellectual property is strictly prohibited
          and will be subject to legal action.
        </p>
        <p>
          Shared Property: The Company will not share any intellectual property
          of the user with any third party, except as required by law. The
          Company will not sell any intellectual property of the user to any
          third party, except as part of the sale of the company in its
          entirety. Users will have the right to distribute and modify their
          intellectual property produced using the Services without restriction,
          except for the Company&apos;s use of the intellectual property for
          marketing or training purposes. Users will have the right to use their
          intellectual property produced using the Services for any purpose,
          including commercial purposes, without restriction, except for the
          Company&apos;s use of the intellectual property for marketing or
          training purposes.
        </p>
        <p>
          Miscellaneous: Entire Agreement: These Terms and Conditions represent
          the entire agreement between you and the Company concerning your use
          of the Services and supersede all prior agreements and understandings,
          whether written or oral, regarding the subject matter herein.
          Governing Law and Jurisdiction: These Terms and Conditions shall be
          governed by and construed in accordance with the laws of United
          Kingdom, without giving effect to any principles of conflicts of law.
          Any legal action or proceeding arising under these Terms and
          Conditions shall be brought exclusively in the courts located in
          [jurisdiction], and the parties hereby irrevocably consent to the
          personal jurisdiction and venue therein. No Waiver: The failure of the
          Company to enforce any right or provision of these Terms and
          Conditions shall not constitute a waiver of such right or provision.
          Any waiver of any provision of these Terms and Conditions will be
          effective only if in writing and signed by the Company. Severability:
          If any provision of these Terms and Conditions is found to be invalid
          or unenforceable, the remaining provisions shall remain in full force
          and effect. Assignment: You may not assign or transfer these Terms and
          Conditions, in whole or in part, without the prior written consent of
          the Company. The Company may freely assign or transfer these Terms and
          Conditions, in whole or in part, without restriction or prior notice
          to you. Survival: The provisions of these Terms and Conditions that,
          by their nature and content, are intended to survive the termination
          of these Terms and Conditions shall survive such termination,
          including but not limited to the provisions regarding intellectual
          property, disclaimers of warranties, limitations of liability,
          indemnification, and jurisdictional issues. Headings: The headings
          used in these Terms and Conditions are for convenience only and do not
          affect the interpretation of these Terms and Conditions.
        </p>
      </ModalBody>
    </Modal>
  );
};

export default TermsModal;
