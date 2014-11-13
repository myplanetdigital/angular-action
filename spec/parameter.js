describe('angular-action parameter directive', function () {
    var scope,
        paramScope;

    function compile(html, scopeProperties) {
        inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            angular.extend(scope, scopeProperties);

            var dom = angular.element(html);

            $compile(dom)(scope);
            scope.$digest();

            paramScope = dom.children().eq(0).scope();
        });
    }

    beforeEach(module('mp.action'));

    describe('scope properties', function () {
        describe('when value attribute not specified', function () {
            beforeEach(function () {
                compile(
                    '<div parameter="TEST_PARAM"><span><!-- parameter scope --></span></div>'
                );
            });

            it('defines scope "$actionData" value as undefined', function () {
                expect(paramScope.$actionData.value).toBe(undefined);
            });

            it('defines scope "$actionData" error as null', function () {
                expect(paramScope.$actionData.error).toBe(null);
            });
        });

        describe('when value attribute specified', function () {
            beforeEach(function () {
                compile(
                    '<div parameter="TEST_PARAM" value="\'INIT_VALUE\'"><span><!-- parameter scope --></span></div>'
                );
            });

            it('defines scope "$actionData" value using specified value', function () {
                expect(paramScope.$actionData.value).toBe('INIT_VALUE');
            });

            it('defines scope "$actionData" error as null', function () {
                expect(paramScope.$actionData.error).toBe(null);
            });
        });
    });

    describe('when $actionCollecting event received', function () {
        var setValueStub,
            flagErrorStub;

        beforeEach(function () {
            setValueStub = jasmine.createSpy('setValueStub');
            flagErrorStub = jasmine.createSpy('flagErrorStub');

            compile(
                '<div parameter="TEST_PARAM" value="\'INIT_VALUE\'"><span><!-- parameter scope --></span></div>'
            );

            scope.$broadcast('$actionCollecting', setValueStub, flagErrorStub);
        });

        it('calls the setter callback with its name and current value', function () {
            expect(setValueStub).toHaveBeenCalledWith('TEST_PARAM', 'INIT_VALUE');
        });

        it('does not call the error callback', function () {
            expect(flagErrorStub).not.toHaveBeenCalled();
        });
    });

    describe('collect attribute', function () {
        describe('when a filter expression is supplied', function () {
            describe('when none of the filters cause an exception', function () {
                var setValueStub,
                    flagErrorStub;

                beforeEach(function () {
                    setValueStub = jasmine.createSpy('setValueStub');
                    flagErrorStub = jasmine.createSpy('flagErrorStub');

                    compile(
                        '<div parameter="TEST_PARAM" value="\'INIT_VALUE\'" collect="lowercase"><span><!-- parameter scope --></span></div>'
                    );

                    scope.$broadcast('$actionCollecting', setValueStub);
                });

                it('calls the setter callback with the current value after passing it through the filters', function () {
                    expect(setValueStub).toHaveBeenCalledWith('TEST_PARAM', 'init_value');
                });

                it('does not call the error callback', function () {
                    expect(flagErrorStub).not.toHaveBeenCalled();
                });
            });

            // describe('when one of the filters causes an exception', function () {
            //     var setValueStub,
            //         flagErrorStub,
            //         exception;

            //     beforeEach(inject(function ($filterProvider) {
            //         setValueStub = jasmine.createSpy('setValueStub');
            //         flagErrorStub = jasmine.createSpy('flagErrorStub');
            //         exception = new Error();

            //         $filterProvider.register('throwsException', function () {
            //             throw exception;
            //         });

            //         compile(
            //             '<div parameter="TEST_PARAM" value="\'INIT_VALUE\'" collect="lowercase | throwsException"><span><!-- parameter scope --></span></div>'
            //         );

            //         scope.$broadcast('$actionCollecting', setValueStub);
            //     }));

            //     it('does not call the setter callback', function () {
            //         expect(setValueStub).not.toHaveBeenCalled();
            //     });

            //     it('calls the error callback with the exception', function () {
            //         expect(flagErrorStub).toHaveBeenCalledWith(exception);
            //     });
            // });
        });
    });

    describe('on-parameter-change attribute', function () {
        describe('when an expression is supplied', function () {
            var onParameterChangeStub;

            beforeEach(function () {
                onParameterChangeStub = jasmine.createSpy('onParameterChangeStub');

                compile(
                    '<div parameter="TEST_PARAM" value="\'INIT_VALUE\'" on-parameter-change="onParameterChangeStub($value)"><span><!-- parameter scope --></span></div>',
                    {
                        onParameterChangeStub: onParameterChangeStub
                    }
                );
            });

            it('the expression in the attribute value is not initially evaluated', function () {
                expect(onParameterChangeStub).not.toHaveBeenCalled();
            });

            describe('when the value changes', function () {
                beforeEach(function () {
                    paramScope.$actionData.value = 'NEW_VALUE';
                    paramScope.$digest();
                });

                it('the expression in the attribute value is evaluated with local variable $value having the new value', function () {
                    expect(onParameterChangeStub).toHaveBeenCalledWith('NEW_VALUE');
                });
            });
        });
    });
});