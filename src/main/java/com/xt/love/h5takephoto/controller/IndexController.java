package com.xt.love.h5takephoto.controller;

import com.xt.love.h5takephoto.entity.Data;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Create User: wangtao
 * Create In 2019-07-31 10:36
 * Description:
 **/
@Controller
public class IndexController {

    @GetMapping("/scan")
    public String scan() {
        return "capture";
    }

    @PostMapping("/picture")
    @ResponseBody
    public String picture(@RequestBody Data data) {
        System.out.println(data.getPhoto());
        return "success";
    }

}
