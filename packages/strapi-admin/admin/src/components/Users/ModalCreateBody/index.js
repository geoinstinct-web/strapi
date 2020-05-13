import React, { forwardRef, useReducer, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { ModalSection } from 'strapi-helper-plugin';
import { FormattedMessage } from 'react-intl';
import { Inputs } from '@buffetjs/custom';
import { Padded, Text } from '@buffetjs/core';
import { Col, Row } from 'reactstrap';
import checkFormValidity from '../../../utils/users/checkFormValidity';
import form from './utils/form';
import { initialState, reducer } from './reducer';
import init from './init';
import Wrapper from './Wrapper';

const ModalCreateBody = forwardRef(({ isDisabled, onSubmit }, ref) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);
  const { modifiedData } = reducerState;
  const buttonSubmitRef = useRef(null);

  useImperativeHandle(ref, () => ({
    submit: () => {
      buttonSubmitRef.current.click();
    },
  }));

  const handleChange = ({ target: { name, value } }) => {
    dispatch({
      type: 'ON_CHANGE',
      keys: name,
      value,
    });
  };

  const handleSubmit = async e => {
    e.persist();
    e.preventDefault();
    const errors = await checkFormValidity(modifiedData);
    console.log(errors);

    if (!errors) {
      onSubmit(e, modifiedData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalSection>
        <Padded top size="18px">
          <Text fontSize="xs" color="grey" fontWeight="bold" textTransform="uppercase">
            <FormattedMessage id="app.components.Users.ModalCreateBody.block-title.details">
              {txt => txt}
            </FormattedMessage>
          </Text>
        </Padded>
      </ModalSection>
      <ModalSection>
        <Wrapper>
          <Padded top size="20px">
            <Row>
              {Object.keys(form).map((inputName, i) => (
                <Col xs="6" key={inputName}>
                  <FormattedMessage id={form[inputName].label}>
                    {label => (
                      <Inputs
                        {...form[inputName]}
                        autoFocus={i === 0}
                        disabled={isDisabled}
                        label={label}
                        name={inputName}
                        onChange={handleChange}
                        value={modifiedData[inputName]}
                      />
                    )}
                  </FormattedMessage>
                </Col>
              ))}
            </Row>
          </Padded>
        </Wrapper>
      </ModalSection>
      <ModalSection>
        <Padded top size="3px">
          <Text fontSize="xs" color="grey" fontWeight="bold" textTransform="uppercase">
            <FormattedMessage id="app.components.Users.ModalCreateBody.block-title.roles">
              {txt => txt}
            </FormattedMessage>
          </Text>
        </Padded>
      </ModalSection>
      <ModalSection>COMING SOON</ModalSection>
      <button type="submit" style={{ display: 'none' }} ref={buttonSubmitRef}>
        hidden button to make to get the native form event
      </button>
    </form>
  );
});

ModalCreateBody.defaultProps = {
  isDisabled: false,
  onSubmit: e => e.preventDefault(),
};

ModalCreateBody.propTypes = {
  isDisabled: PropTypes.bool,
  onSubmit: PropTypes.func,
};

export default ModalCreateBody;
