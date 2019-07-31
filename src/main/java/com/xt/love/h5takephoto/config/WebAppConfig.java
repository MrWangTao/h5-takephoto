package com.xt.love.h5takephoto.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Create User: wangtao
 * Create In 2019-06-17 16:17
 * Description:
 **/
@Configuration
public class WebAppConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**").addResourceLocations("classpath:/images/");
        registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/");
    }

}
